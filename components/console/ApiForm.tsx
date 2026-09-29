"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { Check, Copy } from "lucide-react";

type Variant = "primary" | "secondary" | "danger" | "link";

const styles: Record<Variant, string> = {
  primary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-green px-4 text-sm font-semibold text-on-accent hover:bg-green-strong disabled:opacity-60",
  secondary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 text-sm font-semibold text-ink hover:bg-card-2 disabled:opacity-60",
  danger:
    "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-3 text-sm font-semibold text-danger hover:opacity-90 disabled:opacity-60",
  link: "inline-flex min-h-9 items-center justify-center gap-1 rounded-lg px-2.5 text-sm font-semibold text-green hover:bg-green-soft disabled:opacity-60",
};

export type ApiFormProps = {
  endpoint: string;
  /** Values always sent (partner id, row id, ...). */
  fixed?: Record<string, unknown>;
  /** Field names to send as numbers. */
  numbers?: string[];
  /** Field names to send as arrays (checkbox groups). */
  lists?: string[];
  /** Field names to send as booleans. */
  bools?: string[];
  submitLabel: string;
  pendingLabel: string;
  successLabel?: string;
  variant?: Variant;
  confirm?: string;
  /** Shows the response's `reveal` value once, with a copy button. */
  revealLabel?: string;
  revealHint?: string;
  copyLabel?: string;
  copiedLabel?: string;
  /** Renders the button on the same line as the fields. */
  inline?: boolean;
  resetOnSuccess?: boolean;
  redirectTo?: string;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
};

export function ApiForm(p: ApiFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [reveal, setReveal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (p.confirm && !window.confirm(p.confirm)) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body: Record<string, unknown> = { ...p.fixed };
    for (const key of new Set(fd.keys())) {
      if (p.lists?.includes(key)) body[key] = fd.getAll(key).map(String);
      else {
        const v = String(fd.get(key) ?? "");
        if (p.numbers?.includes(key)) body[key] = v === "" ? undefined : Number(v);
        else if (p.bools?.includes(key)) body[key] = v === "true" || v === "on";
        else body[key] = v;
      }
    }
    for (const l of p.lists ?? []) if (!(l in body)) body[l] = [];
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch(p.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: { message?: string }; reveal?: string };
      if (!res.ok) {
        setError(data.error?.message ?? `HTTP ${res.status}`);
        return;
      }
      if (data.reveal) setReveal(data.reveal);
      setDone(true);
      if (p.resetOnSuccess) form.reset();
      if (p.redirectTo) router.push(p.redirectTo);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!reveal) return;
    try {
      await navigator.clipboard.writeText(reveal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: the value is selectable */
    }
  }

  return (
    <form onSubmit={onSubmit} className={p.className} noValidate={false}>
      <div className={p.inline ? "flex flex-wrap items-end gap-3" : "flex flex-col gap-4"}>
        {p.children}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy || p.disabled} className={styles[p.variant ?? "primary"]}>
            {busy ? p.pendingLabel : p.submitLabel}
          </button>
          {done && !reveal && p.successLabel && (
            <span role="status" className="inline-flex items-center gap-1 text-sm font-semibold text-green">
              <Check className="h-4 w-4" aria-hidden />
              {p.successLabel}
            </span>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {reveal && (
        <div role="status" className="mt-4 rounded-xl border border-green/30 bg-green-soft p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-green">{p.revealLabel}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-card px-3 py-2 font-mono text-xs text-ink">{reveal}</code>
            <button type="button" onClick={copy} className={styles.secondary}>
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? p.copiedLabel : p.copyLabel}
            </button>
          </div>
          {p.revealHint && <p className="mt-2 text-xs text-muted">{p.revealHint}</p>}
        </div>
      )}
    </form>
  );
}
