import { cookies } from "next/headers";
import { z } from "zod";
import { DEV_COOKIE, devAuthAllowed } from "@/lib/server/auth";
import { errorResponse, handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({ email: z.email() });

/** Local development sign-in (disabled when Supabase is configured or in production). */
export const POST = handle(async (req: Request) => {
  if (!devAuthAllowed()) return errorResponse("disabled", "Development sign-in is disabled", 404);
  const { email } = await parseBody(req, Body);
  (await cookies()).set(DEV_COOKIE, email.toLowerCase(), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return json({ ok: true });
});
