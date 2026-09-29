import { sweepExpired } from "@/lib/server/allowances";
import { markOverdue } from "@/lib/server/credit";
import { db } from "@/lib/server/db";
import { deliverEvents } from "@/lib/server/events";
import { errorResponse, handle, json } from "@/lib/server/http";
import { pruneRateLimits } from "@/lib/server/ratelimit";

/** Scheduled maintenance (Vercel Cron). Protected by CRON_SECRET. */
export const GET = handle(async (req: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return errorResponse("unauthorized", "Unauthorized", 401);
  }
  const sql = db();
  const expired = await sql.begin((tx) => sweepExpired(tx));
  const overdue = await sql.begin((tx) => markOverdue(tx));
  const webhooks = await deliverEvents(sql);
  const rateLimitsPruned = await pruneRateLimits(sql);
  return json({ expired, overdue, webhooks, rateLimitsPruned });
});
