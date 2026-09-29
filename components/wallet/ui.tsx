"use client";
import { Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, useEffect, useId, useRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  variant = "primary",
  loading,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  const styles: Record<Variant, string> = {
    primary: "bg-accent text-white hover:opacity-90",
    secondary: "bg-card text-ink hover:bg-line",
    ghost: "text-ink hover:bg-card",
    danger: "bg-danger-soft text-danger hover:opacity-90",
  };
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition active:scale-[0.98] disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  error,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode; error?: string | null }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm text-muted">
        {label}
      </label>
      <input
        id={id}
        {...rest}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${id}-d` : undefined}
        className="h-14 w-full rounded-full border border-line bg-paper px-5 text-base text-ink outline-none placeholder:text-muted focus:border-accent"
      />
      {(hint || error) && (
        <p id={`${id}-d`} className={`mt-2 px-1 text-[13px] ${error ? "text-danger" : "text-muted"}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

export function Select({
  label,
  hint,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-muted">
        {label}
      </label>
      <select
        id={id}
        {...rest}
        className="h-14 w-full appearance-none rounded-full border border-line bg-paper px-5 text-base text-ink outline-none focus:border-accent"
      >
        {children}
      </select>
      {hint && <p className="mt-2 px-1 text-[13px] text-muted">{hint}</p>}
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-[26px] bg-card p-5 ${className}`}>{children}</div>;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "danger" | "success"; children: ReactNode }) {
  const tones = {
    info: "bg-brand-soft text-ink",
    warn: "bg-warn-soft text-warn",
    danger: "bg-danger-soft text-danger",
    success: "bg-green-soft text-green",
  };
  return <div className={`rounded-2xl px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>;
}

/** Bottom sheet dialog. Full height on phones, centred panel on larger screens. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[32px] bg-paper shadow-[var(--pv-shadow)] px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none sm:max-w-md sm:rounded-[32px]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden />
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-ink">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-11 w-11 place-items-center rounded-full bg-card text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Spinner({ className = "h-6 w-6" }: { className?: string }) {
  return <Loader2 className={`animate-spin text-muted ${className}`} aria-hidden />;
}

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          className="fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-[60] mx-auto max-w-sm rounded-full bg-brand px-5 py-3 text-center text-sm font-medium text-white shadow-[var(--pv-shadow)]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small status pill, like "In transit" in a tracking app. */
export function StatusPill({ tone = "info", children }: { tone?: "info" | "success" | "danger" | "muted"; children: ReactNode }) {
  const tones = {
    info: "bg-accent-soft text-accent-text",
    success: "bg-accent-soft text-accent-text",
    danger: "bg-danger-soft text-danger",
    muted: "bg-paper text-muted",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium ${tones[tone]}`}>{children}</span>;
}

/** Section title row with an optional "See all" action. */
export function SectionHead({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[17px] font-medium text-ink">{title}</h2>
      {action && (
        <button onClick={action.onClick} className="text-sm text-ink">
          {action.label}
        </button>
      )}
    </div>
  );
}
