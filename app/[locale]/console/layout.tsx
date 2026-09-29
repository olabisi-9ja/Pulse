import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Shell } from "@/components/console/Shell";
import { PARTNER_COOKIE, pickMembership, requireIdentityOrRedirect } from "@/lib/console/context";
import { isLocale } from "@/lib/i18n";
import { partnerMemberships } from "@/lib/server/auth";
import { getConsoleMessages } from "@/messages/console";

export const metadata: Metadata = {
  title: { default: "Partner Console", template: "%s · PayVault Console" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children, params }: LayoutProps<"/[locale]/console">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const identity = await requireIdentityOrRedirect(locale);
  const memberships = await partnerMemberships(identity.id);
  const cookie = (await cookies()).get(PARTNER_COOKIE)?.value;
  const fallback = pickMembership(memberships, undefined, cookie);
  const t = getConsoleMessages(locale);
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <Shell
        locale={locale}
        t={t.nav}
        memberships={memberships.map((m) => ({ partnerId: m.partnerId, name: m.partnerName, role: m.role }))}
        fallbackId={fallback?.partnerId ?? ""}
        email={identity.email}
        roleLabels={t.labels.role}
      >
        {children}
      </Shell>
    </Suspense>
  );
}
