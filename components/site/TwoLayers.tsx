"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, CloudOff, Wifi, WifiLow } from "lucide-react";
import { useEffect, useState } from "react";
import type { SiteMessages } from "@/messages/site";
import { SectionHeading } from "./ui";

/** The two product layers as one switchable block, each with a live visual. */
export function TwoLayers({ t, headingId }: { t: SiteMessages["twoLayers"]; headingId?: string }) {
  const [layer, setLayer] = useState<"a" | "b">("a");
  const L = layer === "a" ? t.reliability : t.acceptance;
  return (
    <div>
      <SectionHeading id={headingId} eyebrow={t.eyebrow} title={t.title} />

      <div role="tablist" aria-label={t.eyebrow} className="mt-10 inline-flex rounded-full border border-line bg-card p-1">
        {(["a", "b"] as const).map((k) => {
          const x = k === "a" ? t.reliability : t.acceptance;
          const on = layer === k;
          return (
            <button
              key={k}
              role="tab"
              aria-selected={on}
              onClick={() => setLayer(k)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${on ? "bg-green text-on-accent" : "text-ink hover:bg-card-2"}`}
            >
              <span className="opacity-70">{x.tag}</span> · {x.title}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={layer}
          role="tabpanel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-8 grid items-center gap-10 rounded-[2rem] rounded-br-[6rem] bg-card p-7 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14"
        >
          <div>
            <h3 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.02] text-navy">{L.title}</h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{L.body}</p>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {L.points.slice(0, 3).map((p) => (
                <li key={p} className="py-3.5 text-sm text-ink sm:text-base">
                  {p}
                </li>
              ))}
            </ul>
          </div>
          {layer === "a" ? <StatesVisual states={t.reliability.states} v={t.visual} /> : <VaultVisual v={t.visual} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Steps through the connectivity states; queued payments settle when the phone is back. */
function StatesVisual({ states, v }: { states: readonly string[]; v: SiteMessages["twoLayers"]["visual"] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(reduce ? states.length - 1 : 0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % states.length), 1500);
    return () => clearInterval(id);
  }, [reduce, states.length]);
  const settled = i === states.length - 1;
  const offline = i === 2;
  const Icon = offline ? CloudOff : i === 1 || i === 3 ? WifiLow : Wifi;
  return (
    <div aria-hidden className="rounded-[1.75rem] bg-[#0b1726] p-6 text-white sm:p-8">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-white/70">
          <Icon className={`h-4 w-4 ${offline ? "text-[#e7b35a]" : "text-[#2fb386]"}`} />
          {states[i]}
        </span>
        <span className="tabular text-xs text-white/50">
          {i + 1}/{states.length}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-1.5">
        {states.map((s, n) => (
          <span key={s} className={`h-1.5 rounded-full transition-colors duration-500 ${n <= i ? "bg-[#2fb386]" : "bg-white/15"}`} />
        ))}
      </div>
      <ul className="mt-6 space-y-2">
        {[
          ["Market stall", "−1,500"],
          ["Bus fare", "−500"],
          ["Pharmacy", "−3,200"],
        ].map(([n, a], k) => {
          const done = settled || (i >= 4 && k === 0);
          return (
            <li key={n} className="flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3 text-sm">
              <span>{n}</span>
              <span className="flex items-center gap-3">
                <span className="tabular text-white/80">{a}</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors duration-500 ${
                    done ? "bg-[#2fb386]/20 text-[#4cc79c]" : "bg-white/10 text-white/60"
                  }`}
                >
                  {done && <Check className="h-3 w-3" />}
                  {done ? states[states.length - 1] : v.queued}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Spends a vault down past its funded part into the overdraft, then refills. */
function VaultVisual({ v }: { v: SiteMessages["twoLayers"]["visual"] }) {
  const reduce = useReducedMotion();
  const steps = [
    { funded: 18000, credit: 4000 },
    { funded: 12000, credit: 4000 },
    { funded: 5000, credit: 4000 },
    { funded: 0, credit: 2500 },
  ];
  const [i, setI] = useState(reduce ? 2 : 0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % steps.length), 1700);
    return () => clearInterval(id);
  }, [reduce, steps.length]);
  const s = steps[i];
  const cap = 22000;
  const fmt = (v: number) => `XOF ${v.toLocaleString("en-US")}`;
  return (
    <div aria-hidden className="rounded-[1.75rem] bg-[#14365a] p-6 text-white sm:p-8">
      <p className="text-sm text-white/70">{v.available}</p>
      <p className="tabular mt-2 font-display text-[clamp(2.25rem,5vw,3.25rem)] font-medium leading-none">{fmt(s.funded + s.credit)}</p>
      <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-white/15">
        <span className="bg-white transition-all duration-700 ease-out" style={{ width: `${(s.funded / cap) * 100}%` }} />
        <span className="bg-[#2fb386] transition-all duration-700 ease-out" style={{ width: `${(s.credit / cap) * 100}%` }} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/[0.07] p-4">
          <dt className="text-white/60">{v.funded}</dt>
          <dd className="tabular mt-1 text-lg font-medium">{fmt(s.funded)}</dd>
        </div>
        <div className="rounded-2xl bg-white/[0.07] p-4">
          <dt className="text-white/60">{v.overdraft}</dt>
          <dd className="tabular mt-1 text-lg font-medium text-[#4cc79c]">{fmt(s.credit)}</dd>
        </div>
      </dl>
    </div>
  );
}
