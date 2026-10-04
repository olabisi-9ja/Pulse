import { db } from "@/lib/server/db";
import { errorResponse, handle, json } from "@/lib/server/http";
import { runMaintenance } from "@/lib/server/maintenance";

/** Scheduled maintenance (Vercel Cron). Protected by CRON_SECRET. */
export const GET = handle(async (req: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return errorResponse("unauthorized", "Unauthorized", 401);
  }
  return json(await runMaintenance(db()));
});
