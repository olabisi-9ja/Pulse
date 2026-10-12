import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/server/db";
import { normalizePhone } from "@/lib/server/identity";
import { ussdReply } from "@/lib/server/ussd";

/**
 * Africa's Talking USSD callback. Configure the callback URL as
 * https://<host>/api/ussd?key=<USSD_SECRET>; the provider doesn't sign requests,
 * so the key in the URL is what keeps strangers from driving the menu.
 */
export async function POST(req: Request) {
  const secret = process.env.USSD_SECRET;
  const key = new URL(req.url).searchParams.get("key") ?? "";
  const ok = secret ? key.length === secret.length && timingSafeEqual(Buffer.from(key), Buffer.from(secret)) : process.env.NODE_ENV !== "production";
  if (!ok) return new Response("END Service unavailable", { status: 403, headers: { "content-type": "text/plain" } });

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
