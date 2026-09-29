import { notFound } from "next/navigation";
import { DocsShell, type NavGroup } from "@/components/docs/DocsShell";
import { isLocale } from "@/lib/i18n";
import { getDocsMessages, NAV_GROUPS, PAGE_SLUGS } from "@/messages/docs";

export default async function DocsLayout({ children, params }: LayoutProps<"/[locale]/docs">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDocsMessages(locale);
  const groups: NavGroup[] = NAV_GROUPS.map((g) => ({
    label: t.shell.groups[g.key],
    items: g.pages.map((key) => ({
      title: t.pages[key].title,
      href: `/${locale}/docs${PAGE_SLUGS[key] ? `/${PAGE_SLUGS[key]}` : ""}`,
    })),
  }));
  const s = t.shell;
  const labels = {
    docs: s.docs,
    skip: s.skip,
    menu: s.menu,
    closeMenu: s.closeMenu,
    navLabel: s.navLabel,
    switchTo: s.switchTo,
    switchLabel: s.switchLabel,
    prev: s.prev,
    next: s.next,
  };
  return (
    <DocsShell locale={locale} groups={groups} labels={labels}>
      {children}
    </DocsShell>
  );
}
