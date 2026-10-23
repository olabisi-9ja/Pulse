import { cookies } from "next/headers";
import { supabaseConfigured, supabaseServer } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json } from "@/lib/server/http";
import { endSession, SESSION_COOKIE } from "@/lib/server/phoneauth";

export const POST = handle(async () => {
  if (supabaseConfigured()) await (await supabaseServer()).auth.signOut();
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await endSession(db(), token);
  store.delete(SESSION_COOKIE);
  return json({ ok: true });
});
