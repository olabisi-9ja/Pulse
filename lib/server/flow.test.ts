/**
 * End-to-end money flows against a real Postgres (DATABASE_URL).
 * Skipped when no database is configured.
 */
import { randomUUID } from "node:crypto";
import {
  createRequest,
  encodeBundle,
  encodeClose,
  exportPublicKey,
  generateKeyPair,
  initWalletState,
  signClose,
  signPayment,
  type AllowanceCert,
  type WalletState,
} from "@payvault/protocol";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeWithStatement, issueForUser } from "./allowances";
import { creditSummary, loansForUser, repayFromWallet } from "./credit";
import { db, type Sql } from "./db";
import { createUser, enableMerchant, registerDevice, submitKyc, userById } from "./identity";
import { balances, sandboxTopUp } from "./money";
import { ingestBundles } from "./settlement";

const enabled = !!process.env.DATABASE_URL;
let sql: Sql;

beforeAll(() => {
  if (enabled) sql = db();
});
afterAll(async () => {
  if (enabled) await sql.end();
});

async function newUser(country = "NG", merchantName?: string) {
  const id = randomUUID();
  await sql.begin(async (tx) => {
    await createUser(tx, { id, email: `${id}@test.payvault`, displayName: "Test " + id.slice(0, 4), country, locale: "en" });
    if (merchantName) await enableMerchant(tx, id, merchantName);
  });
  return (await userById(sql, id))!;
}

async function newPayer(topUp: number) {
  const user = await newUser();
  const device = await generateKeyPair();
  const d = await sql.begin(async (tx) => {
    await sandboxTopUp(tx, user.id, topUp);
    await submitKyc(tx, user.id, "NIN", "12345678901");
    return registerDevice(tx, user.id, await exportPublicKey(device.publicKey), "test phone");
  });
  return { user: (await userById(sql, user.id))!, device, deviceId: d.id };
}

async function pay(key: CryptoKey, state: WalletState, merchantId: Uint8Array, amount: number) {
  const req = createRequest(merchantId, amount, state.cert.currency, "Shop");
  const r = await signPayment(key, state, req);
  return { ...r, bytes: encodeBundle({ cert: state.cert, payment: r.payment }) };
}

async function ledgerSum(): Promise<number> {
  const [r] = await sql<{ s: number }[]>`select coalesce(sum(balance), 0)::bigint as s from pv.accounts`;
  return r.s;
}

describe.skipIf(!enabled)("settlement flows", () => {
  it("issues a vault with overdraft, settles, draws credit, and catches a cloned-device double spend", async () => {
    const { user, device, deviceId } = await newPayer(4_000_000);
    const shopA = await newUser("NG", "Mama Put");
    const shopB = await newUser("NG", "Kiosk");

    const credit = await creditSummary(sql, user);
    expect(credit.available).toBeGreaterThan(0);

    const cert: AllowanceCert = await sql.begin((tx) =>
      issueForUser(tx, { userId: user.id, deviceId, funded: 1_000_000, credit: 200_000 }),
    );
    expect(await balances(sql, user)).toMatchObject({ wallet: 3_000_000, vault: 1_000_000 });

    const s0 = await initWalletState(cert);
    const p1 = await pay(device.privateKey, s0, shopA.merchant_id!, 800_000);
    const p2 = await pay(device.privateKey, p1.state, shopA.merchant_id!, 400_000);

    const res = await ingestBundles(sql, { kind: "user", userId: shopA.id }, [p1.bytes, p2.bytes, p1.bytes]);
    expect(res.map((r) => r.status)).toEqual(["settled", "settled", "duplicate"]);
    expect((await balances(sql, shopA)).merchant).toBe(1_200_000);
    expect((await balances(sql, user)).vault).toBe(0);

    const [loan] = await loansForUser(sql, user.id);
    expect(loan).toMatchObject({ principal: 200_000, fee: 4_000, status: "open" });

    // Cloned device replays from the initial state at another merchant.
    const clone = await pay(device.privateKey, s0, shopB.merchant_id!, 900_000);
    const [forked] = await ingestBundles(sql, { kind: "user", userId: shopB.id }, [clone.bytes]);
    expect(forked.status).toBe("flagged");
    expect((await balances(sql, shopB)).merchant).toBe(900_000); // merchant still paid
    expect((await balances(sql, user)).wallet).toBe(3_000_000 - 900_000); // recovered from the holder

    const [a] = await sql`select status from pv.allowances where id = ${cert.allowanceId}`;
    expect(a.status).toBe("revoked");
    const cases = await sql`select kind from pv.fraud_cases where allowance_id = ${cert.allowanceId}`;
    expect(cases.map((c) => c.kind)).toContain("fork");
    expect((await creditSummary(sql, (await userById(sql, user.id))!)).available).toBe(0);

    // Repay the overdraft from the wallet.
    const repaid = await sql.begin((tx) => repayFromWallet(tx, user.id));
    expect(repaid).toBe(204_000);
    expect((await loansForUser(sql, user.id))[0].status).toBe("repaid");

    expect(await ledgerSum()).toBe(0);
  });

  it("cashes out early with a signed close statement, then closes when the last payment syncs", async () => {
    const { user, device, deviceId } = await newPayer(2_000_000);
    const shop = await newUser("NG", "Bus Park");
    const cert = await sql.begin((tx) => issueForUser(tx, { userId: user.id, deviceId, funded: 1_000_000, credit: 0 }));
    const s0 = await initWalletState(cert);
    const p1 = await pay(device.privateKey, s0, shop.merchant_id!, 300_000);
    const close = await signClose(device.privateKey, p1.state);

    const a = await sql.begin((tx) => closeWithStatement(tx, encodeClose(close), { userId: user.id }));
    expect(a.status).toBe("closing");
    expect(await balances(sql, user)).toMatchObject({ wallet: 1_700_000, vault: 300_000 });

    const [r] = await ingestBundles(sql, { kind: "user", userId: user.id }, [p1.bytes]);
    expect(r.status).toBe("settled");
    const [row] = await sql`select status from pv.allowances where id = ${cert.allowanceId}`;
    expect(row.status).toBe("closed");
    expect((await balances(sql, user)).vault).toBe(0);
    expect(await ledgerSum()).toBe(0);
  });

  it("rejects forged certificates and payments to unknown merchants", async () => {
    const { user, device, deviceId } = await newPayer(2_000_000);
    const cert = await sql.begin((tx) => issueForUser(tx, { userId: user.id, deviceId, funded: 500_000, credit: 0 }));
    const s0 = await initWalletState({ ...cert, funded: 5_000_000 });
    const forged = await pay(device.privateKey, s0, new Uint8Array(8).fill(1), 100_000);
    const [r1] = await ingestBundles(sql, { kind: "user", userId: user.id }, [forged.bytes]);
    expect(r1).toMatchObject({ status: "rejected", code: "cert_mismatch" });

    const s1 = await initWalletState(cert);
    const unknown = await pay(device.privateKey, s1, new Uint8Array(8).fill(7), 100_000);
    const [r2] = await ingestBundles(sql, { kind: "user", userId: user.id }, [unknown.bytes]);
    expect(r2).toMatchObject({ status: "rejected", code: "unknown_merchant" });
  });

  it("enforces vault and overdraft limits", async () => {
    const { user, deviceId } = await newPayer(20_000_000);
    await expect(
      sql.begin((tx) => issueForUser(tx, { userId: user.id, deviceId, funded: 4_000_000, credit: 0 })),
    ).rejects.toMatchObject({ code: "over_limit" });
    await expect(
      sql.begin((tx) => issueForUser(tx, { userId: user.id, deviceId, funded: 100_000, credit: 9_000_000 })),
    ).rejects.toMatchObject({ code: "over_credit" });
  });
});
