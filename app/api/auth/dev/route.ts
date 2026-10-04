import { cookies } from "next/headers";
import { z } from "zod";
import { DEV_COOKIE, devAuthAllowed } from "@/lib/server/auth";
import { errorResponse, handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({ email: z.email() });

/** Email-only sign-in for local development and PV_DEMO_AUTH demos (off when Supabase is configured). */
export const POST = handle(async (req: Request) => {
  if (!devAuthAllowed()) return errorResponse("disabled", "Development sign-in is disabled", 404);
  const { email } = await parseBody(req, Body);
  (await cookies()).set(DEV_COOKIE, email.toLowerCase(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return json({ ok: true });
});
