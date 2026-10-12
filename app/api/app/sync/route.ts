import { fromBase64Url } from "@payvault/protocol";
import { after } from "next/server";
import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zB64u } from "@/lib/server/http";
import { ingestBundles } from "@/lib/server/settlement";
import { notifySettled } from "@/lib/server/notify";
import { networkSnapshot } from "@/lib/server/snapshot";

const Body = z.object({ bundles: z.array(zB64u).max(500) });

/** Uploads offline payments held on this device (as merchant, payer or courier). */
export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const { bundles } = await parseBody(req, Body);
  const results = await ingestBundles(db(), { kind: "user", userId: user.id }, bundles.map(fromBase64Url));
  const settled = results.filter((r) => r.status === "settled" && r.id).map((r) => r.id!);
  if (settled.length) after(() => notifySettled(db(), settled));
  return json({ results, network: await networkSnapshot(db()) });
});
