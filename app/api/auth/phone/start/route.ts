import { z } from "zod";
import { phoneAuthAllowed } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { errorResponse, handle, json, parseBody } from "@/lib/server/http";
import { normalizePhone } from "@/lib/server/identity";
import { startLogin } from "@/lib/server/phoneauth";
import { clientIp, rateLimit } from "@/lib/server/ratelimit";
import { sendSms } from "@/lib/server/sms";

const Body = z.object({ phone: z.string().max(32), locale: z.enum(["en", "fr"]).default("en") });

/** Texts a 6-digit sign-in code. */
export const POST = handle(async (req: Request) => {
  if (!phoneAuthAllowed()) return errorResponse("disabled", "Phone sign-in is not configured", 404);
  const body = await parseBody(req, Body);
  const phone = normalizePhone(body.phone);
  if (!phone) return errorResponse("invalid_phone", "Enter the number with its country code, e.g. +234…", 400);
  await rateLimit(`login-ip:${clientIp(req)}`, 20, 3600);
  await rateLimit(`login:${phone}`, 3, 900);
  const code = await startLogin(db(), phone);
  await sendSms(
    phone,
    body.locale === "fr" ? `PayVault : votre code de connexion est ${code}. Ne le partagez pas.` : `PayVault: your sign-in code is ${code}. Don't share it.`,
  );
  return json({ ok: true, phone });
});
