import { db } from "@/lib/server/db";
import { gatewayAllowed } from "@/lib/server/gateway";
import { normalizePhone } from "@/lib/server/identity";
import { ussdReply } from "@/lib/server/ussd";

/**
 * Africa's Talking USSD callback. Configure the callback URL as
 * https://<host>/api/ussd?key=<USSD_SECRET>; the provider doesn't sign requests,
 * so the key in the URL is what keeps strangers from driving the menu.
 */
export async function POST(req: Request) {
  if (!gatewayAllowed(req)) return new Response("END Service unavailable", { status: 403, headers: { "content-type": "text/plain" } });

  const form = await req.formData();
  const phone = normalizePhone(String(form.get("phoneNumber") ?? ""));
  let reply: string;
  try {
    reply = phone ? await ussdReply(db(), phone, String(form.get("text") ?? "")) : "END Unknown number";
  } catch (err) {
    console.error("ussd failed", err);
    reply = "END Something went wrong. Try again.";
  }
  return new Response(reply, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
