import { relayToBundles } from "@payvault/protocol";
import { after } from "next/server";
import { db } from "@/lib/server/db";
import { gatewayAllowed } from "@/lib/server/gateway";
import { normalizePhone } from "@/lib/server/identity";
import { notifySettled } from "@/lib/server/notify";
import { rateLimit } from "@/lib/server/ratelimit";
import { ingestBundles } from "@/lib/server/settlement";
import { sendSms } from "@/lib/server/sms";

/**
 * Africa's Talking inbound SMS callback (https://<host>/api/sms/inbound?key=<USSD_SECRET>).
 * A phone with signal but no data texts its waiting payments here; they settle on arrival.
 */
export async function POST(req: Request) {
  if (!gatewayAllowed(req)) return new Response("forbidden", { status: 403 });
  const form = await req.formData();
  const from = normalizePhone(String(form.get("from") ?? ""));
  const bundles = relayToBundles(String(form.get("text") ?? ""));
  if (!from || !bundles) return new Response("ignored");
  try {
    await rateLimit(`sms-in:${from}`, 30, 3600);
  } catch {
    return new Response("rate limited", { status: 429 });
  }
  const results = await ingestBundles(db(), { kind: "relay" }, bundles);
  const settled = results.filter((r) => r.status === "settled" && r.id).map((r) => r.id!);
  const delivered = results.filter((r) => r.status === "settled" || r.status === "duplicate" || r.status === "flagged").length;
  after(async () => {
    if (settled.length) await notifySettled(db(), settled);
    await sendSms(from, `PayVault: ${delivered} payment(s) received.`);
  });
  return new Response("ok");
}
