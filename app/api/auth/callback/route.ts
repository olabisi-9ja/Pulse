import { NextResponse } from "next/server";
import { supabaseConfigured, supabaseServer } from "@/lib/server/auth";

/** Magic-link landing: exchanges the code for a session, then returns to the app. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  if (code && supabaseConfigured()) {
    await (await supabaseServer()).auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
