"use client";

import { motion, type MotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { Vignette, type VignetteKind } from "./Vignettes";

export type StackItem = {
  title: string;
  body: string;
  /** Short label above the title, e.g. who acts in this step. */
  tag?: string;
  /** Built-in product visual. */
  visual?: VignetteKind;
  /** Or a real image from /public, which takes precedence over `visual`. */
  image?: { src: string; alt: string };
};

// Brand surfaces, fixed in both themes so white text always reads.
const TONES = ["bg-[#14365a] text-white", "bg-[#046b4f] text-white", "bg-[#0d2742] text-white", "bg-[#1d4a78] text-white"];

/**
 * Cards pin under the header and the next one slides over the previous as you
 * scroll; covered cards shrink back slightly. Static stack with reduced motion.
 */
export function StackCards({ items }: { items: StackItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} className="mt-10">
      {items.map((item, i) => (
        <StackCard key={item.title} item={item} i={i} n={items.length} progress={scrollYProgress} />
      ))}
    </div>
  );
}

function StackCard({ item, i, n, progress }: { item: StackItem; i: number; n: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const scale = useTransform(progress, [i / n, 1], [1, 1 - (n - 1 - i) * 0.04]);
  const last = i === n - 1;
  return (
    <div className={`sticky ${last ? "" : "pb-[18vh] md:pb-[24vh]"}`} style={{ top: `calc(5.5rem + ${i * 1.1}rem)` }}>
      <motion.article
        style={reduce ? undefined : { scale, transformOrigin: "top center" }}
        className={`grid overflow-hidden rounded-[2rem] shadow-[0_-12px_40px_-24px_rgb(0_0_0/0.5)] md:min-h-[26rem] md:grid-cols-[1.05fr_1fr] ${TONES[i % TONES.length]}`}
      >
        <div className="flex flex-col justify-end gap-3 p-7 sm:p-10">
          {item.tag && (
            <span className="w-fit rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-wide text-white/85">{item.tag}</span>
          )}
          <h3 className="font-display text-2xl font-medium leading-tight text-balance sm:text-[2rem]">{item.title}</h3>
          <p className="max-w-md text-[0.95rem] leading-relaxed text-white/75 sm:text-base">{item.body}</p>
        </div>
        <div className="relative flex min-h-[15rem] items-center justify-center bg-black/15 p-6 sm:p-10" aria-hidden>
          {item.image ? (
            <Image src={item.image.src} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          ) : item.visual ? (
            <Vignette kind={item.visual} />
          ) : null}
        </div>
      </motion.article>
    </div>
  );
}
