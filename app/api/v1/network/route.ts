import { db } from "@/lib/server/db";
import { handle, json } from "@/lib/server/http";
import { requirePartner } from "@/lib/server/partner-api";
import { networkSnapshot } from "@/lib/server/snapshot";

export const GET = handle(async (req: Request) => {
  await requirePartner(req);
  const since = Number(new URL(req.url).searchParams.get("since"));
  return json(await networkSnapshot(db(), since ? new Date(since * 1000) : undefined));
});
