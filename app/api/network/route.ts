import { db } from "@/lib/server/db";
import { handle, json } from "@/lib/server/http";
import { networkSnapshot } from "@/lib/server/snapshot";

/** Public: issuer keys and revocations that devices cache for offline verification. */
export const GET = handle(async (req: Request) => {
  const since = new URL(req.url).searchParams.get("since");
  const date = since ? new Date(Number(since) * 1000) : undefined;
  return json(await networkSnapshot(db(), date && !isNaN(date.getTime()) ? date : undefined));
});
