import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  executeTapPayment,
  getOrProvisionPan,
  TapPaymentError,
  verifyCashAfricaWebhook,
} from "./cashafrica";
import { db, type Sql } from "./db";
import { createUser, enableMerchant, userById } from "./identity";
import { balances, sandboxTopUp } from "./money";

const enabled = !!process.env.DATABASE_URL;
let sql: Sql;

beforeAll(() => {
  if (enabled) sql = db();
});
afterAll(async () => {
  if (enabled) await sql.end();
});

describe.skipIf(!enabled)("CashAfrica Tap-to-Pay", () => {
  async function makeUser(merchantName?: string) {
    const id = randomUUID();
    await sql.begin(async (tx) => {
      await createUser(tx, {
        id,
        email: `cashtap-${id.slice(0, 8)}@test.com`,
        displayName: "Tap User " + id.slice(0, 4),
        country: "NG",
        locale: "en",
      });
      if (merchantName) {
        await enableMerchant(tx, id, merchantName);
      }
    });
    return (await userById(sql, id))!;
  }

  it("provisions and retrieves a CashTap virtual PAN", async () => {
    const user = await makeUser();
    const pan1 = await sql.begin((tx) => getOrProvisionPan(tx, user));

    expect(pan1.userId).toBe(user.id);
    expect(pan1.status).toBe("active");
    expect(pan1.pan).toBeDefined();
    expect(pan1.maskedPan).toContain("••••");
    expect(pan1.expiry).toMatch(/^\d{2}\/\d{2}$/);

    // Calling it again returns the same active PAN
    const pan2 = await sql.begin((tx) => getOrProvisionPan(tx, user));
    expect(pan2.id).toBe(pan1.id);
    expect(pan2.pan).toBe(pan1.pan);
  });

  it("executes Tap-to-Pay payment between payer and merchant", async () => {
    const payer = await makeUser();
    const merchant = await makeUser("Mama Put Cafe");

    // Top up payer wallet with 10,000 NGN (minor units)
    await sql.begin((tx) => sandboxTopUp(tx, payer.id, 10_000));

    const initialPayerBal = await balances(sql, payer);
    const initialMerchantBal = await balances(sql, merchant);
    expect(initialPayerBal.wallet).toBe(10_000);
    expect(initialMerchantBal.merchant).toBe(0);

    // Pay 3,500 NGN via contactless tap
    const res = await sql.begin((tx) =>
      executeTapPayment(tx, {
        payer,
        merchant,
        amount: 3_500,
        currency: "NGN",
        transport: "nfc",
      }),
    );

    expect(res.status).toBe("completed");
    expect(res.amount).toBe(3_500);
    expect(res.currency).toBe("NGN");
    expect(res.transport).toBe("nfc");
    expect(res.ref).toMatch(/^ca_tap_/);

    // Balances reflect the instant settlement
    const finalPayerBal = await balances(sql, payer);
    const finalMerchantBal = await balances(sql, merchant);
    expect(finalPayerBal.wallet).toBe(6_500);
    expect(finalMerchantBal.merchant).toBe(3_500);
  });

  it("rejects tap payment if insufficient funds", async () => {
    const payer = await makeUser();
    const merchant = await makeUser("Tech Store");

    await sql.begin((tx) => sandboxTopUp(tx, payer.id, 500));

    await expect(
      sql.begin((tx) =>
        executeTapPayment(tx, {
          payer,
          merchant,
          amount: 5_000,
          currency: "NGN",
        }),
      ),
    ).rejects.toThrow(TapPaymentError);
  });

  it("rejects self payment", async () => {
    const user = await makeUser("My Own Shop");
    await sql.begin((tx) => sandboxTopUp(tx, user.id, 5_000));

    await expect(
      sql.begin((tx) =>
        executeTapPayment(tx, {
          payer: user,
          merchant: user,
          amount: 1_000,
          currency: "NGN",
        }),
      ),
    ).rejects.toThrow(TapPaymentError);
  });

  it("verifies webhook signature correctly", () => {
    const payload = JSON.stringify({ event: "payment.success", data: { reference: "ca_tap_123" } });
    expect(verifyCashAfricaWebhook(payload, null)).toBe(true);
  });
});
