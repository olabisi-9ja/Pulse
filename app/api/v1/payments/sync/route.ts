import { fromBase64Url } from "@payvault/protocol";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zB64u } from "@/lib/server/http";
import { requirePartner } from "@/lib/server/partner-api";
import { ingestBundles } from "@/lib/server/settlement";

const Body = z.object({ bundles: z.array(zB64u).min(1).max(500) });

/** Submit offline payment bundles collected by your devices. Idempotent per payment. */
export const POST = handle(async (req: Request) => {
  const partner = await requirePartner(req);
  const { bundles } = await parseBody(req, Body);
  const results = await ingestBundles(db(), { kind: "api", partnerId: partner.id }, bundles.map(fromBase64Url));
  return json({ results });
});
