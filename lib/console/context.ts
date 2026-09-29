import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { currentIdentity, type Identity, type Membership, partnerMemberships } from "@/lib/server/auth";
import { isLocale, type Locale } from "@/lib/i18n";
import { getConsoleMessages, type ConsoleMessages } from "@/messages/console";

export const PARTNER_COOKIE = "pv_partner";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SearchParams = Record<string, string | string[] | undefined>;

export const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/** Picks the partner from ?p=, then the cookie, then the first membership. */
export function pickMembership(memberships: Membership[], p?: string, cookie?: string): Membership | undefined {
  for (const cand of [p, cookie]) {
    if (cand && UUID.test(cand)) {
      const m = memberships.find((x) => x.partnerId === cand.toLowerCase());
      if (m) return m;
    }
  }
  return memberships[0];
}

export type ConsoleContext = {
  locale: Locale;
  t: ConsoleMessages;
  identity: Identity;
  memberships: Membership[];
  membership: Membership;
  partnerId: string;
  canWrite: boolean;
  isOwner: boolean;
  /** Builds a console URL that keeps the selected partner when the user has several. */
  href: (path: string, params?: Record<string, string | number | undefined | null>) => string;
};

export async function requireIdentityOrRedirect(locale: Locale): Promise<Identity> {
  const identity = await currentIdentity();
  if (!identity) redirect(`/${locale}/sign-in?next=/${locale}/console`);
  return identity;
}

/** Loads identity and the selected partner; sends the user to sign-in or onboarding when needed. */
export async function getConsoleContext(locale: Locale, sp: SearchParams = {}): Promise<ConsoleContext> {
  const identity = await requireIdentityOrRedirect(locale);
  const memberships = await partnerMemberships(identity.id);
  const cookie = (await cookies()).get(PARTNER_COOKIE)?.value;
  const membership = pickMembership(memberships, first(sp.p), cookie);
  if (!membership) redirect(`/${locale}/console/onboarding`);
  const multi = memberships.length > 1;
  return {
    locale,
    t: getConsoleMessages(locale),
    identity,
    memberships,
    membership,
    partnerId: membership.partnerId,
    canWrite: membership.role === "owner" || membership.role === "admin",
    isOwner: membership.role === "owner",
    href: (path, params = {}) => {
      const q = new URLSearchParams();
      if (multi) q.set("p", membership.partnerId);
      for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
      const s = q.toString();
      return `/${locale}/console${path}${s ? `?${s}` : ""}`;
    },
  };
}

/** Shared page entry: validates the locale, then loads the console context and search params. */
export async function pageContext(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const sp = await props.searchParams;
  return { ctx: await getConsoleContext(locale, sp), sp };
}
