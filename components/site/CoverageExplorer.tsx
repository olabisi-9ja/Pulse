"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

export type ExplorerCountry = {
  code: string;
  name: string;
  region: string;
  bloc?: string;
  currencyCode: string;
  currencyName: string;
  perPayment: string;
  cap: string;
  rails: string[];
  papss: boolean;
  authority: string;
  residency: string;
  status: string;
  concept: boolean;
};

type Labels = {
  all: string;
  hint: string;
  regions: Record<string, string>;
  perPayment: string;
  cap: string;
  rails: string;
  papss: string;
  dataLaw: string;
};

// Country positions (longitude, latitude): true centroids, nudged apart along the crowded Gulf of Guinea.
const POS: Record<string, [number, number]> = {
  SN: [-14.5, 14.5], CI: [-7.2, 7.4], GH: [-2.2, 6.9], TG: [1.2, 11.6], BJ: [4.0, 7.6], NG: [9.6, 11.2],
  CM: [12.4, 5.7], MA: [-6.5, 31.9], EG: [30.0, 26.6], ET: [39.6, 8.6], UG: [32.4, 1.4], KE: [37.9, 0.3],
  RW: [29.9, -1.9], TZ: [34.9, -6.4], ZA: [24.3, -29.0],
};

// Simplified continent outline and Madagascar, as (longitude, latitude).
const AFRICA: [number, number][] = [
  [-9.8, 30], [-6, 35.8], [10, 37.3], [11, 33], [20, 31], [25, 31.5], [32, 31.3], [34.5, 28], [35.5, 23.5], [38, 18],
  [43, 12.5], [51, 11.8], [48, 5], [41.5, -1.5], [40, -10.5], [40.5, -15], [35, -20], [35.5, -24], [32.5, -29],
  [27, -33.8], [20, -34.8], [18.4, -34], [17.5, -28.5], [14.5, -22.5], [11.8, -17], [13.5, -11], [12.3, -6], [9, -1],
  [9.5, 3.8], [8.5, 4.5], [4, 6.3], [-1, 5], [-7.5, 4.4], [-10, 6.5], [-13.3, 8.5], [-16.7, 12.5], [-17.5, 14.7],
  [-16.5, 19.5], [-17, 21], [-13, 27.5],
];
const MADAGASCAR: [number, number][] = [[49.3, -12], [50.5, -15.5], [47.5, -25], [43.5, -22], [44.3, -17]];

const px = ([lon, lat]: [number, number]) => [(lon + 20) * 10, (38 - lat) * 10] as const;
const path = (pts: [number, number][]) => `M${pts.map((p) => px(p).join(",")).join(" L")} Z`;

/** Interactive coverage map: region filter, country nodes on the continent, and a live detail panel. */
export function CoverageExplorer({ countries, labels, regions }: { countries: ExplorerCountry[]; labels: Labels; regions: string[] }) {
  const reduce = useReducedMotion();
  const [region, setRegion] = useState<string>("all");
  const visible = useMemo(() => countries.filter((c) => region === "all" || c.region === region), [countries, region]);
  const [selected, setSelected] = useState(countries[0]?.code ?? "");
  const [touched, setTouched] = useState(false);
  const current = countries.find((c) => c.code === selected) ?? visible[0];

  // Gently tour the countries until the visitor takes over.
  useEffect(() => {
    if (touched || reduce || visible.length < 2) return;
    const id = setInterval(() => {
      setSelected((code) => {
        const i = visible.findIndex((c) => c.code === code);
        return visible[(i + 1) % visible.length].code;
      });
    }, 3200);
    return () => clearInterval(id);
  }, [touched, reduce, visible]);

  const pick = (code: string) => {
    setTouched(true);
    setSelected(code);
  };
  const pickRegion = (r: string) => {
    setTouched(true);
    setRegion(r);
    const first = countries.find((c) => r === "all" || c.region === r);
    if (first) setSelected(first.code);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={labels.all}>
        {["all", ...regions].map((r) => {
          const n = r === "all" ? countries.length : countries.filter((c) => c.region === r).length;
          const on = region === r;
          return (
            <button
              key={r}
              onClick={() => pickRegion(r)}
              aria-pressed={on}
              className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors ${
                on ? "bg-green text-on-accent" : "border border-line text-ink hover:border-ink"
              }`}
            >
              {r === "all" ? labels.all : labels.regions[r]}
              <span className={`tabular text-xs ${on ? "opacity-80" : "text-muted"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        {/* Map */}
        <div className="relative mx-auto w-full max-w-[34rem]">
          <svg viewBox="-10 -10 770 770" className="h-auto w-full" role="img" aria-label={labels.hint}>
            <path d={path(AFRICA)} className="fill-card stroke-line" strokeWidth={2} />
            <path d={path(MADAGASCAR)} className="fill-card stroke-line" strokeWidth={2} />
            {countries.map((c) => {
              const [x, y] = px(POS[c.code] ?? [0, 0]);
              const inRegion = region === "all" || c.region === region;
              const on = current?.code === c.code;
              return (
                <g
                  key={c.code}
                  role="button"
                  tabIndex={0}
                  aria-label={c.name}
                  aria-pressed={on}
                  onClick={() => pick(c.code)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pick(c.code))}
                  className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-ink"
                  style={{ opacity: inRegion ? 1 : 0.25, transition: "opacity 300ms" }}
                >
                  <circle cx={x} cy={y} r={on ? 26 : 18} className={on ? "fill-green" : "fill-[#14365a]"} strokeWidth={4} stroke="transparent" style={{ transition: "r 250ms, fill 250ms" }} />
                  {on && <circle cx={x} cy={y} r={36} className="fill-none stroke-green" strokeWidth={2} opacity={0.5} />}
                  <text x={x} y={y + 5} textAnchor="middle" className="pointer-events-none fill-white font-display text-[14px] font-medium">
                    {c.code}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="mt-2 text-center text-xs text-muted">{labels.hint}</p>
        </div>

        {/* Detail */}
        <div className="min-h-[26rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            {current && (
              <motion.article
                key={current.code}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-[1.75rem] rounded-br-[5rem] bg-card p-7 sm:p-9"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted">
                      {labels.regions[current.region]}
                      {current.bloc && <> · {current.bloc}</>}
                    </p>
                    <h3 className="mt-1 font-display text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-none text-navy">{current.name}</h3>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${current.concept ? "bg-warn-soft text-warn" : "bg-green-soft text-green"}`}
                  >
                    {current.status}
                  </span>
                </div>

                <p className="mt-6 text-base text-ink">
                  <span className="font-display text-2xl font-medium text-green">{current.currencyCode}</span>{" "}
                  <span className="text-muted">{current.currencyName}</span>
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    [labels.perPayment, current.perPayment],
                    [labels.cap, current.cap],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-card-2 p-4">
                      <dt className="text-xs text-muted">{k}</dt>
                      <dd className="tabular mt-1 font-display text-xl font-medium text-ink sm:text-2xl">{v}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-6 text-xs text-muted">{labels.rails}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {current.rails.map((r) => (
                    <li key={r} className="rounded-full border border-line px-3 py-1 text-xs text-ink">
                      {r}
                    </li>
                  ))}
                  {current.papss && <li className="rounded-full bg-green-soft px-3 py-1 text-xs font-medium text-green">{labels.papss}</li>}
                </ul>

                <p className="mt-6 text-xs text-muted">{labels.dataLaw}</p>
                <p className="mt-1 text-sm text-ink">
                  {current.authority} <span className="text-muted">· {current.residency}</span>
                </p>
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
