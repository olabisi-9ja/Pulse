import { cookies } from "next/headers";
import { DEV_COOKIE, supabaseConfigured, supabaseServer } from "@/lib/server/auth";
import { handle, json } from "@/lib/server/http";

export const POST = handle(async () => {
  if (supabaseConfigured()) await (await supabaseServer()).auth.signOut();
  (await cookies()).delete(DEV_COOKIE);
  return json({ ok: true });
});
