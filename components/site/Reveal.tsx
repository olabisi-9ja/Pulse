"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Gentle entrance animation. Renders plain content when reduced motion is requested. */
export function Reveal({
  children,
  delay = 0,
  className,
  onMount = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Animate on mount instead of when scrolled into view (for above-the-fold content). */
  onMount?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  const visible = { opacity: 1, y: 0 };
  // Above-the-fold content stays visible without JavaScript: no hidden initial state.
  if (onMount) {
    return (
      <motion.div
        className={className}
        initial={false}
        animate={visible}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={visible}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
