import { z } from "zod";
import { requirePartnerRole } from "@/lib/server/auth";
import { createApiKey } from "@/lib/server/apikeys";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({ partnerId: z.guid(), name: z.string().trim().min(1).max(60) });

/** Creates a key. The full key is in the response once and is never stored. */
export const POST = handle(async (req: Request) => {
  const b = await parseBody(req, Body);
  const { identity } = await requirePartnerRole(b.partnerId, ["owner", "admin"]);
  const key = await db().begin((tx) => createApiKey(tx, b.partnerId, b.name, identity.id));
  return json({ ok: true, reveal: key.key });
});
