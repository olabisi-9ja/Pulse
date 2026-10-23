import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db, type Sql } from "./db";
import { createUser } from "./identity";
import { sessionByToken, startLogin, verifyLogin } from "./phoneauth";

const enabled = !!process.env.DATABASE_URL;
let sql: Sql;
beforeAll(() => {
  if (enabled) sql = db();
});
afterAll(async () => {
  if (enabled) await sql.end();
});

const phone = () => "+234" + String(Math.floor(1e9 + Math.random() * 8.9e9));

describe.skipIf(!enabled)("phone sign-in", () => {
  it("signs a new number into one pending account, then into the onboarded one", async () => {
    const p = phone();
    const code = await startLogin(sql, p);
    const wrong = code === "123456" ? "654321" : "123456";
    expect(await sql.begin((tx) => verifyLogin(tx, p, wrong))).toBeNull();
    const t1 = (await sql.begin((tx) => verifyLogin(tx, p, code)))!;
    expect(t1).toBeTruthy();
    expect(await sql.begin((tx) => verifyLogin(tx, p, code))).toBeNull(); // single use
    const s1 = (await sessionByToken(sql, t1))!;
    expect(s1).toMatchObject({ phone: p, email: null });

    // A second device before onboarding lands in the same account.
    const t2 = (await sql.begin(async (tx) => verifyLogin(tx, p, await startLogin(tx, p))))!;
    expect((await sessionByToken(sql, t2))!.userId).toBe(s1.userId);

    await sql.begin((tx) => createUser(tx, { id: s1.userId, email: null, phone: p, displayName: "Ada", country: "NG", locale: "en" }));
    const t3 = (await sql.begin(async (tx) => verifyLogin(tx, p, await startLogin(tx, p))))!;
    expect((await sessionByToken(sql, t3))!.userId).toBe(s1.userId);
    expect(await sessionByToken(sql, "nope")).toBeNull();
  });

  it("burns the code after 5 wrong tries", async () => {
    const p = phone();
    const code = await startLogin(sql, p);
    const wrong = code === "000000" ? "111111" : "000000";
    for (let i = 0; i < 5; i++) expect(await sql.begin((tx) => verifyLogin(tx, p, wrong))).toBeNull();
    expect(await sql.begin((tx) => verifyLogin(tx, p, code))).toBeNull();
  });

  it("signs a phone linked to an existing email account into that account", async () => {
    const [id, p] = [randomUUID(), phone()];
    await sql.begin(async (tx) => {
      await createUser(tx, { id, email: `${id}@t.pv`, displayName: "Iya", country: "NG", locale: "en" });
      await tx`update pv.users set phone = ${p} where id = ${id}`;
    });
    const t = (await sql.begin(async (tx) => verifyLogin(tx, p, await startLogin(tx, p))))!;
    expect(await sessionByToken(sql, t)).toMatchObject({ userId: id, email: `${id}@t.pv` });
  });
});
