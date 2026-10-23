import { cookies } from "next/headers";
import { z } from "zod";
import { phoneAuthAllowed } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { errorResponse, handle, json, parseBody } from "@/lib/server/http";
import { normalizePhone } from "@/lib/server/identity";
import { SESSION_COOKIE, SESSION_DAYS, verifyLogin } from "@/lib/server/phoneauth";
import { clientIp, rateLimit } from "@/lib/server/ratelimit";

const Body = z.object({ phone: z.string().max(32), code: z.string().regex(/^\d{6}$/) });

/** Checks the texted code and sets the session cookie. */
export const POST = handle(async (req: Request) => {
  if (!phoneAuthAllowed()) return errorResponse("disabled", "Phone sign-in is not configured", 404);
  const body = await parseBody(req, Body);
  const phone = normalizePhone(body.phone);
  if (!phone) return errorResponse("invalid_phone", "Invalid phone number", 400);
  await rateLimit(`login-verify-ip:${clientIp(req)}`, 30, 3600);
  const token = await db().begin((tx) => verifyLogin(tx, phone, body.code));
  if (!token) return errorResponse("invalid_code", "That code didn't work", 400);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
  return json({ ok: true });
});
