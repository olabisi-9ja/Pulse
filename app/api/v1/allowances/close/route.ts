import { fromBase64Url, toHex } from "@payvault/protocol";
import { z } from "zod";
import { closeWithStatement } from "@/lib/server/allowances";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zB64u } from "@/lib/server/http";
import { requirePartner } from "@/lib/server/partner-api";

const Body = z.object({ close: zB64u });

export const POST = handle(async (req: Request) => {
  const partner = await requirePartner(req);
  const body = await parseBody(req, Body);
  const a = await db().begin((tx) => closeWithStatement(tx, fromBase64Url(body.close), { partnerId: partner.id }));
  return json({ id: toHex(a.id), status: a.status, declared: { seq: a.declared_seq, cumulative: a.declared_cumulative } });
});
