import { ChevronRight, Gauge, ShieldCheck } from "lucide-react";
import type { SiteMessages } from "@/messages/site";
import { CheckList, SectionHeading } from "./ui";

/** Reliability layer (with connectivity state machine) and guaranteed offline acceptance. */
export function TwoLayers({ t, headingId }: { t: SiteMessages["twoLayers"]; headingId?: string }) {
  const { reliability: a, acceptance: b } = t;
  return (
    <div>
      <SectionHeading id={headingId} eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-line bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-on-accent" aria-hidden>
              <Gauge className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-green">{a.tag}</p>
              <h3 className="font-display text-xl font-medium text-navy">{a.title}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{a.body}</p>

          <p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted">{a.statesLabel}</p>
          <ol className="mt-3 flex flex-wrap items-center gap-y-2">
            {a.states.map((s, i) => {
              const last = i === a.states.length - 1;
              return (
                <li key={s} className="flex items-center">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      last ? "bg-green text-on-accent" : i === 2 ? "bg-warn-soft text-warn" : "bg-navy-soft text-navy"
                    }`}
                  >
                    {s}
                  </span>
                  {!last && <ChevronRight className="mx-0.5 h-4 w-4 text-muted" aria-hidden />}
                </li>
              );
            })}
          </ol>

          <CheckList items={a.points} className="mt-6" />
        </article>

        <article className="rounded-3xl border border-green bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green text-on-accent" aria-hidden>
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-green">{b.tag}</p>
              <h3 className="font-display text-xl font-medium text-navy">{b.title}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{b.body}</p>
          <CheckList items={b.points} className="mt-6" />
        </article>
      </div>
    </div>
  );
}
