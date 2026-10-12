import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { merchantStats } from "./credit";
import { db, type Sql } from "./db";
import { createUser, enableMerchant, merchantCode, startPhoneLink, submitKyc, userById } from "./identity";
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
    });
    // Linking: the app shows a code; it only counts when entered over USSD from that number.
    const payerCode = await sql.begin((tx) => startPhoneLink(tx, payerId, payerPhone, "1234"));
    const traderCode = await sql.begin((tx) => startPhoneLink(tx, traderId, traderPhone, "4321"));
    expect(await ussdReply(sql, payerPhone, "")).toMatch(/^CON PayVault\nEnter the link code/);
    expect(await ussdReply(sql, "+2349999999999", payerCode)).toMatch(/wrong or expired/); // code from another number
    expect(await ussdReply(sql, payerPhone, payerCode)).toMatch(/^END Number linked/);
    expect(await ussdReply(sql, traderPhone, traderCode)).toMatch(/^END Number linked/);
    const code = await sql.begin((tx) => merchantCode(tx, traderId));
    expect(code).toMatch(/^[0-9]{8}$/);

    expect(await ussdReply(sql, "+2340000000000", "12345")).toMatch(/^END That code is wrong or expired/);
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

  it("wipes the USSD PIN after 10 wrong tries in a row", async () => {
    const id = randomUUID();
    const p = phone();
    await sql.begin((tx) => createUser(tx, { id, email: `${id}@t.pv`, displayName: "Bisi", country: "NG", locale: "en" }));
    const code = await sql.begin((tx) => startPhoneLink(tx, id, p, "1111"));
    await ussdReply(sql, p, code);
    const { checkUssdPin } = await import("./identity");
    for (let i = 0; i < 9; i++) expect(await checkUssdPin(sql, (await userById(sql, id))!, "0000")).toBe("wrong");
    expect(await checkUssdPin(sql, (await userById(sql, id))!, "0000")).toBe("locked");
    expect(await checkUssdPin(sql, (await userById(sql, id))!, "1111")).toBe("locked"); // right PIN no longer works
  });
});
