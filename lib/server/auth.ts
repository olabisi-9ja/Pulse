import "server-only";
/**
 * Identity comes from Supabase Auth (email OTP / magic link). Without Supabase
 * configured, development builds fall back to a local email sign-in so the
 * product can be run end to end on a laptop. Production refuses that fallback.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "./db";
import { type AppUser, userById } from "./identity";

export type Identity = { id: string; email: string };

export const supabaseConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export const devAuthAllowed = () => !supabaseConfigured() && process.env.NODE_ENV !== "production";

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

export const DEV_COOKIE = "pv_dev_email";

/** Deterministic UUID for a dev email, so the same email maps to the same user. */
export async function devUserId(email: string): Promise<string> {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email.toLowerCase())));
  h[6] = (h[6] & 0x0f) | 0x50;
  h[8] = (h[8] & 0x3f) | 0x80;
  const hex = [...h.slice(0, 16)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export async function currentIdentity(): Promise<Identity | null> {
  if (supabaseConfigured()) {
    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    return data.user?.email ? { id: data.user.id, email: data.user.email } : null;
  }
  if (!devAuthAllowed()) return null;
  const email = (await cookies()).get(DEV_COOKIE)?.value;
  return email ? { id: await devUserId(email), email } : null;
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
