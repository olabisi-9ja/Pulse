import { z } from "zod";
import { requirePartnerRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";
import { rotateIssuerKey } from "@/lib/server/issuer";

const Body = z.object({ partnerId: z.guid() });

export const POST = handle(async (req: Request) => {
  const b = await parseBody(req, Body);
  await requirePartnerRole(b.partnerId, ["owner"]);
  const kid = await db().begin((tx) => rotateIssuerKey(tx, b.partnerId));
  return json({ ok: true, kid });
});
