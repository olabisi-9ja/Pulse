import { BarChart3 } from "lucide-react";
import type { SiteMessages } from "@/messages/site";
import { SectionHeading } from "./ui";

/** What the console tracks in a pilot. Presented as measures, not achieved results. */
export function MetricsGrid({ t, headingId }: { t: SiteMessages["metrics"]; headingId?: string }) {
  return (
    <div>
      <SectionHeading id={headingId} eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((m) => (
          <li key={m} className="flex gap-3 rounded-2xl border border-line bg-card p-4 text-sm font-semibold leading-snug text-navy">
            <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-green" aria-hidden />
            {m}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-muted">{t.note}</p>
    </div>
  );
}
