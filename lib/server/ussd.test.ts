import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { merchantStats } from "./credit";
import { db, type Sql } from "./db";
import { createUser, enableMerchant, linkPhone, merchantCode, submitKyc, userById } from "./identity";
import { balances, sandboxTopUp } from "./money";
import { ussdReply } from "./ussd";

const enabled = !!process.env.DATABASE_URL;
let sql: Sql;
beforeAll(() => {
  if (enabled) sql = db();
});
afterAll(async () => {
  if (enabled) await sql.end();
});

const phone = () => "+234" + String(Math.floor(1e9 + Math.random() * 8.9e9));

describe.skipIf(!enabled)("USSD", () => {
  it("lets a basic phone pay a trader by code with a PIN, and the sale counts as a trading day", async () => {
    const [payerId, traderId] = [randomUUID(), randomUUID()];
    const [payerPhone, traderPhone] = [phone(), phone()];
    await sql.begin(async (tx) => {
      await createUser(tx, { id: payerId, email: `${payerId}@t.pv`, displayName: "Ada", country: "NG", locale: "en" });
      await createUser(tx, { id: traderId, email: `${traderId}@t.pv`, displayName: "Iya", country: "NG", locale: "en" });
      await enableMerchant(tx, traderId, "Iya Basira Foods");
      await submitKyc(tx, payerId, "NIN", "12345678901");
      await sandboxTopUp(tx, payerId, 1_000_000);
      await linkPhone(tx, payerId, payerPhone, "1234");
      await linkPhone(tx, traderId, traderPhone, "4321");
    });
    const code = await sql.begin((tx) => merchantCode(tx, traderId));
    expect(code).toMatch(/^[0-9]{8}$/);

    expect(await ussdReply(sql, "+2340000000000", "")).toMatch(/^END .*isn't linked/);
    expect(await ussdReply(sql, payerPhone, "")).toMatch(/^CON PayVault/);
    expect(await ussdReply(sql, payerPhone, "1")).toMatch(/^END Balance: .*10,000/);
    expect(await ussdReply(sql, payerPhone, `2*${code}`)).toContain("Iya Basira Foods");
    expect(await ussdReply(sql, payerPhone, `2*${code}*2500`)).toMatch(/^CON Pay .*2,500.* Enter PIN/);
    expect(await ussdReply(sql, payerPhone, `2*${code}*2500*9999`)).toBe("END Wrong PIN.");
    expect(await ussdReply(sql, payerPhone, `2*${code}*2500*1234`)).toMatch(/^END Paid .*2,500.* Ref ca_tap_/);

    const trader = (await userById(sql, traderId))!;
    expect((await balances(sql, trader)).merchant).toBe(250_000);
    expect(await ussdReply(sql, traderPhone, "3")).toMatch(/^END Takings: .*2,500/);
    expect(await ussdReply(sql, traderPhone, "4")).toBe(`END Your trader code: ${code}`);
    expect((await merchantStats(sql, trader)).tradingDays).toBe(1);
  });
});
