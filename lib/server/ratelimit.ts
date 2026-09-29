import "server-only";
import { ServiceError } from "./allowances";
import { db, type Db } from "./db";

/**
 * Counts a request against `key` in a fixed window and throws 429 once `limit`
 * is passed. Backed by Postgres because serverless instances share no memory.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number, sql: Db = db()): Promise<void> {
  const [row] = await sql<{ count: number }[]>`
    insert into pv.rate_limits (key, window_start)
    values (${key}, to_timestamp(floor(extract(epoch from now()) / ${windowSeconds}) * ${windowSeconds}))
    on conflict (key, window_start) do update set count = pv.rate_limits.count + 1
    returning count`;
  if (row.count > limit) throw new ServiceError("rate_limited", "Too many requests. Try again shortly.", 429);
}

/** Client IP as reported by the platform proxy (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Drops counters older than a day. Called from the daily cron. */
export async function pruneRateLimits(sql: Db = db()): Promise<number> {
  const rows = await sql`delete from pv.rate_limits where window_start < now() - interval '1 day' returning 1`;
  return rows.length;
}
