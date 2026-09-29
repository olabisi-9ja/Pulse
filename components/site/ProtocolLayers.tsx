import type { SiteMessages } from "@/messages/site";
import { SectionHeading } from "./ui";

/** Seven-layer stack, layer 1 at the bottom. Each layer steps slightly narrower toward the top on desktop. */
export function ProtocolLayers({ t }: { t: SiteMessages["layers"] }) {
  const layers = t.items.map((l, i) => ({ ...l, n: i + 1 }));
  return (
    <div>
      <SectionHeading title={t.title} lead={t.lead} />
      <ol className="mt-10 flex flex-col-reverse gap-2.5">
        {layers.map((l) => (
          <li
            key={l.n}
            className={`flex items-center gap-4 rounded-2xl border border-line p-4 sm:px-6 ${
              l.n === 2 || l.n === 6 ? "bg-green-soft" : "bg-card"
            }`}
          >
            <span className="tabular flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm font-extrabold text-on-accent">
              {l.n}
            </span>
            <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[14rem_1fr] sm:gap-6">
              <h3 className="font-display text-base font-bold text-navy">{l.name}</h3>
              <p className="text-sm leading-relaxed text-muted">{l.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
