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
import { closeWithStatement, freezeDevice, issueForUser, sweepExpired } from "./allowances";
import { creditSummary, loansForUser, merchantStats, repayFromWallet } from "./credit";
import { seedDemoTrader } from "./demo";
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
  }, 30_000);

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

  it("applies holder-chosen limits and refuses ones above the country pack", async () => {
    const { user, deviceId } = await newPayer(2_000_000);
    const cert = await sql.begin((tx) =>
      issueForUser(tx, { userId: user.id, deviceId, funded: 500_000, credit: 0, perTxLimit: 100_000, maxPayments: 3, ttlHours: 6 }),
    );
    expect(cert).toMatchObject({ perTxLimit: 100_000, maxPayments: 3 });
    expect(cert.expiresAt - cert.issuedAt).toBe(6 * 3600);

    const other = await newPayer(2_000_000);
    await expect(
      sql.begin((tx) => issueForUser(tx, { userId: other.user.id, deviceId: other.deviceId, funded: 100_000, credit: 0, maxPayments: 70_000 })),
    ).rejects.toMatchObject({ code: "over_limit" });
  });

  it("freezes a lost phone: revokes its vault, blocks new ones, honours earlier payments, refunds the rest after expiry", async () => {
    const { user, device, deviceId } = await newPayer(2_000_000);
    const shop = await newUser("NG", "Kiosk");
    const cert = await sql.begin((tx) => issueForUser(tx, { userId: user.id, deviceId, funded: 1_000_000, credit: 0 }));
    const p1 = await pay(device.privateKey, await initWalletState(cert), shop.merchant_id!, 300_000);

    const res = await sql.begin((tx) => freezeDevice(tx, user.id, deviceId));
    expect(res.revoked).toBe(1);
    const [a] = await sql`select status from pv.allowances where id = ${cert.allowanceId}`;
    expect(a.status).toBe("revoked");
    const [r] = await sql`select reason from pv.revocations where allowance_id = ${cert.allowanceId}`;
    expect(r.reason).toBe("device_lost");

    await expect(
      sql.begin((tx) => issueForUser(tx, { userId: user.id, deviceId, funded: 100_000, credit: 0 })),
    ).rejects.toMatchObject({ code: "bad_device" });

    // Signed before the freeze reached the merchant: still paid.
    const [settled] = await ingestBundles(sql, { kind: "user", userId: shop.id }, [p1.bytes]);
    expect(settled.status).not.toBe("rejected");
    expect((await balances(sql, shop)).merchant).toBe(300_000);

    // Another user can't freeze this phone.
    const stranger = await newUser();
    await expect(sql.begin((tx) => freezeDevice(tx, stranger.id, deviceId))).rejects.toMatchObject({ code: "not_found" });

    // Not refunded blind at expiry: the phone may still hold unsynced payments.
    await sql`update pv.allowances set expires_at = now() - interval '2 days' where id = ${cert.allowanceId}`;
    await sql.begin((tx) => sweepExpired(tx));
    expect((await balances(sql, user)).vault).toBeGreaterThan(0);
    await sql`update pv.allowances set expires_at = now() - interval '31 days' where id = ${cert.allowanceId}`;
    await sql.begin((tx) => sweepExpired(tx));
    const after = await balances(sql, user);
    expect(after.vault).toBe(0);
    expect(after.wallet).toBe(2_000_000 - 300_000);
    const [still] = await sql`select status from pv.allowances where id = ${cert.allowanceId}`;
    expect(still.status).toBe("revoked");
  });

  it("seeds a demo trader whose three weeks of offline takings unlock credit", async () => {
    const trader = await newUser("NG");
    const res = await seedDemoTrader(sql, trader.id);
    expect(res.tradingDays).toBe(18); // 21 days, every 7th off
    const after = (await userById(sql, trader.id))!;
    const stats = await merchantStats(sql, after);
    expect(stats.customers).toBe(6);
    expect(res.sales).toBeGreaterThan(36);
    expect((await creditSummary(sql, after)).credit_limit).toBeGreaterThan(0);
    await expect(seedDemoTrader(sql, trader.id)).rejects.toMatchObject({ code: "already_seeded" });
  }, 60_000);

  it("settles a payment carried by a stranger's phone or an SMS (relay), paying the right trader once", async () => {
    const { bundlesToRelay, relayToBundles } = await import("@payvault/protocol");
    const { user, device, deviceId } = await newPayer(2_000_000);
    const shop = await newUser("NG", "Relay Shop");
    const cert = await sql.begin((tx) => issueForUser(tx, { userId: user.id, deviceId, funded: 500_000, credit: 0 }));
    const p1 = await pay(device.privateKey, await initWalletState(cert), shop.merchant_id!, 120_000);
    const carried = relayToBundles(bundlesToRelay([p1.bytes]))!;
    const [r] = await ingestBundles(sql, { kind: "relay" }, carried);
    expect(r.status).toBe("settled");
    const [row] = await sql`select received_via from pv.payments where allowance_id = ${cert.allowanceId}`;
    expect(row.received_via).toBe("courier");
    expect((await balances(sql, shop)).merchant).toBe(120_000);
    const [again] = await ingestBundles(sql, { kind: "relay" }, carried); // second carrier, same payment
    expect(again.status).toBe("duplicate");
    expect((await balances(sql, shop)).merchant).toBe(120_000);
  });
});
