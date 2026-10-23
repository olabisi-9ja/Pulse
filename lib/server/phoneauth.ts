import "server-only";
/**
 * Phone sign-in: a 6-digit code by SMS (Africa's Talking), then an opaque
 * session token in an httpOnly cookie. Only hashes are stored.
 */
import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import type { Db } from "./db";

export const SESSION_COOKIE = "pv_session";
export const SESSION_DAYS = 30;
const CODE_MINUTES = 10;
const MAX_ATTEMPTS = 5;

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

/** Issues a fresh code for `phone`, replacing any earlier one. */
export async function startLogin(tx: Db, phone: string): Promise<string> {
  const code = String(randomInt(100_000, 1_000_000));
  await tx`
    insert into pv.login_codes (phone, code_hash, expires_at)
    values (${phone}, ${sha(`${phone}:${code}`)}, now() + make_interval(mins => ${CODE_MINUTES}))
    on conflict (phone) do update set code_hash = excluded.code_hash, attempts = 0, expires_at = excluded.expires_at`;
  return code;
}

/**
 * Checks the code (5 tries, then it's burned) and opens a session. The phone signs
 * into the account it is linked to, or a new one that onboarding then creates.
 */
export async function verifyLogin(tx: Db, phone: string, code: string): Promise<string | null> {
  const [row] = await tx<{ code_hash: string; attempts: number }[]>`
    select code_hash, attempts from pv.login_codes where phone = ${phone} and expires_at > now() for update`;
  if (!row || row.attempts >= MAX_ATTEMPTS) return null;
  if (row.code_hash !== sha(`${phone}:${code.trim()}`)) {
    await tx`update pv.login_codes set attempts = attempts + 1 where phone = ${phone}`;
    return null;
  }
  await tx`delete from pv.login_codes where phone = ${phone}`;
  const [linked] = await tx<{ id: string }[]>`select id from pv.users where phone = ${phone}`;
  // Before onboarding, reuse the id an earlier session got so two devices land in one account.
  const [pending] = linked ? [] : await tx<{ user_id: string }[]>`
    select s.user_id from pv.sessions s where s.phone = ${phone} and s.expires_at > now()
      and not exists (select 1 from pv.users u where u.id = s.user_id) limit 1`;
  const userId = linked?.id ?? pending?.user_id ?? randomUUID();
  const token = randomBytes(32).toString("base64url");
  await tx`insert into pv.sessions (token_hash, user_id, phone, expires_at)
           values (${sha(token)}, ${userId}, ${phone}, now() + make_interval(days => ${SESSION_DAYS}))`;
  return token;
}

export type Session = { userId: string; phone: string; email: string | null };

export async function sessionByToken(tx: Db, token: string): Promise<Session | null> {
  const [s] = await tx<{ user_id: string; phone: string; email: string | null }[]>`
    select s.user_id, s.phone, u.email from pv.sessions s left join pv.users u on u.id = s.user_id
    where s.token_hash = ${sha(token)} and s.expires_at > now()`;
  return s ? { userId: s.user_id, phone: s.phone, email: s.email } : null;
}

export async function endSession(tx: Db, token: string): Promise<void> {
  await tx`delete from pv.sessions where token_hash = ${sha(token)}`;
}

/** Drops expired codes and sessions. Called from maintenance. */
export async function pruneAuth(tx: Db): Promise<number> {
  const a = await tx`delete from pv.login_codes where expires_at < now() returning 1`;
  const b = await tx`delete from pv.sessions where expires_at < now() returning 1`;
  return a.length + b.length;
}
