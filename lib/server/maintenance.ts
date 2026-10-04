import "server-only";
/**
 * Scheduled maintenance: expiry sweep, overdue loans, webhook delivery,
 * rate-limit pruning. Run by /api/cron when a scheduler exists, and
 * opportunistically from app traffic (at most hourly) when it doesn't.
 */
import { after } from "next/server";
import { sweepExpired } from "./allowances";
import { markOverdue } from "./credit";
import { db, type Db, type Sql } from "./db";
import { deliverEvents } from "./events";
import { pruneRateLimits } from "./ratelimit";

export async function runMaintenance(sql: Sql) {
  const expired = await sql.begin((tx) => sweepExpired(tx));
  const overdue = await sql.begin((tx) => markOverdue(tx));
  const webhooks = await deliverEvents(sql);
  const rateLimitsPruned = await pruneRateLimits(sql);
  return { expired, overdue, webhooks, rateLimitsPruned };
}

/** Claims the job if it hasn't run within `everyMinutes`; only one instance wins. */
async function claim(sql: Db, name: string, everyMinutes: number): Promise<boolean> {
  const rows = await sql`
    insert into pv.job_runs (name, last_run) values (${name}, now())
    on conflict (name) do update set last_run = now()
      where pv.job_runs.last_run < now() - make_interval(mins => ${everyMinutes})
    returning name`;
  return rows.length > 0;
}

/** Schedules maintenance after the response if it is due. Never throws into the request. */
export function maintenanceIfDue(): void {
  after(async () => {
    try {
      const sql = db();
      if (await claim(sql, "maintenance", 60)) await runMaintenance(sql);
    } catch (err) {
      console.error("maintenance failed", err);
    }
  });
}
