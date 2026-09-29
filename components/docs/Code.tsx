"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  code: string;
  /** Caption shown in the header, e.g. a file name or "Request". */
  label?: string;
  copyLabel?: string;
  copiedLabel?: string;
};

const isComment = (line: string) => /^\s*(\/\/|#)/.test(line);

/**
 * Code block on an inverted surface (readable in light and dark). There is no
 * syntax highlighter; comment lines are dimmed and everything else uses the
 * theme tokens.
 */
export function Code({ code, label, copyLabel = "Copy", copiedLabel = "Copied" }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: the text stays selectable */
    }
  }

  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <figure className="my-5 min-w-0 overflow-hidden rounded-2xl border border-line bg-ink text-paper">
      <figcaption className="flex items-center justify-between gap-3 border-b border-paper/15 py-1.5 pl-4 pr-2 text-xs font-semibold text-paper/70">
        <span className="min-w-0 truncate">{label ?? ""}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-paper/80 hover:bg-paper/10 hover:text-paper"
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          <span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
        </button>
      </figcaption>
      <pre className="overflow-x-auto p-4 text-[0.8rem] leading-relaxed" tabIndex={0}>
        <code className="font-mono">
          {lines.map((line, i) => (
            <span key={i} className={`block min-h-[1.25em] ${isComment(line) ? "text-paper/55" : ""}`}>
              {line}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
