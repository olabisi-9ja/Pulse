import { devAuthAllowed, supabaseConfigured } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

export function GET() {
  return json({ mode: supabaseConfigured() ? "supabase" : devAuthAllowed() ? "dev" : "unavailable" });
}
