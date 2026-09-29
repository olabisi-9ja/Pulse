import { z } from "zod";
import { requirePartnerRole } from "@/lib/server/auth";
import { revokeApiKey } from "@/lib/server/apikeys";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({ partnerId: z.guid(), id: z.guid() });

export const POST = handle(async (req: Request) => {
  const b = await parseBody(req, Body);
  await requirePartnerRole(b.partnerId, ["owner", "admin"]);
  await db().begin((tx) => revokeApiKey(tx, b.partnerId, b.id));
  return json({ ok: true });
});
