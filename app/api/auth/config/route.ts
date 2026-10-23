import { phoneAuthAllowed, supabaseConfigured } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

/**
 * Sign-in mode plus the public Supabase settings, read at request time so the
 * same build works on hosts that only inject env vars at runtime.
 */
export function GET() {
  if (supabaseConfigured()) {
    return json({
      mode: "supabase",
      supabase: { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
    });
  }
  return json({ mode: phoneAuthAllowed() ? "phone" : "unavailable" });
}
