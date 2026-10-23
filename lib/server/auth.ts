import "server-only";
/**
 * Identity comes from phone sign-in (SMS code, lib/server/phoneauth.ts), or from
 * Supabase Auth (email OTP) when Supabase is configured. Phone sign-in needs
 * Africa's Talking (AT_USERNAME/AT_API_KEY) in production; in development the
 * code is printed to the server log instead of texted.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "./db";
import { type AppUser, userById } from "./identity";
import { SESSION_COOKIE, sessionByToken } from "./phoneauth";

export type Identity = { id: string; email: string | null; phone: string | null };

export const supabaseConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

/** Sandbox demo data (seeded sales) on a deployed build. Sandbox money only. */
export const demoMode = () => process.env.PV_DEMO_AUTH === "1";

export const smsConfigured = () => !!(process.env.AT_USERNAME && process.env.AT_API_KEY);

export const phoneAuthAllowed = () => !supabaseConfigured() && (smsConfigured() || process.env.NODE_ENV !== "production");

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const c of list) store.set(c.name, c.value, c.options);
        } catch {
          // Called from a Server Component; the proxy/route refreshes cookies instead.
        }
      },
    },
  });
}

export async function currentIdentity(): Promise<Identity | null> {
  if (supabaseConfigured()) {
    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    return data.user?.email ? { id: data.user.id, email: data.user.email, phone: null } : null;
  }
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = token ? await sessionByToken(db(), token) : null;
  return s ? { id: s.userId, email: s.email, phone: s.phone } : null;
}

/** PV_ADMIN_EMAILS lists administrator emails and/or phone numbers. */
export function isAdmin(identity: Identity): boolean {
  const admins = (process.env.PV_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return [identity.email?.toLowerCase(), identity.phone].some((x) => !!x && admins.includes(x));
}

export class AuthError extends Error {
  constructor(public readonly code: "unauthenticated" | "not_onboarded" | "forbidden") {
    super(code);
  }
}

export async function requireIdentity(): Promise<Identity> {
  const id = await currentIdentity();
  if (!id) throw new AuthError("unauthenticated");
  return id;
}

export async function requireAppUser(): Promise<AppUser> {
  const id = await requireIdentity();
  const user = await userById(db(), id.id);
  if (!user) throw new AuthError("not_onboarded");
  return user;
}

export type Membership = { partnerId: string; role: "owner" | "admin" | "analyst"; partnerName: string };

export async function partnerMemberships(userId: string): Promise<Membership[]> {
  const rows = await db()<{ partner_id: string; role: Membership["role"]; name: string }[]>`
    select m.partner_id, m.role, p.name from pv.partner_members m join pv.partners p on p.id = m.partner_id
    where m.user_id = ${userId} order by p.name`;
  return rows.map((r) => ({ partnerId: r.partner_id, role: r.role, partnerName: r.name }));
}

export async function requirePartnerRole(
  partnerId: string,
  roles: Membership["role"][] = ["owner", "admin", "analyst"],
): Promise<{ identity: Identity; membership: Membership }> {
  const identity = await requireIdentity();
  const m = (await partnerMemberships(identity.id)).find((x) => x.partnerId === partnerId);
  if (!m || !roles.includes(m.role)) throw new AuthError("forbidden");
  return { identity, membership: m };
}
