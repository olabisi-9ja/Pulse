"use client";
import { Delete } from "lucide-react";
import { useEffect, useState } from "react";

/** Numeric PIN entry with a keypad. Submits automatically at `length` digits. */
export function PinPad({
  title,
  hint,
  error,
  length = 4,
  busy,
  onSubmit,
}: {
  title: string;
  hint?: string;
  error?: string | null;
  length?: number;
  busy?: boolean;
  onSubmit: (pin: string) => void;
}) {
  const [pin, setPin] = useState("");
  // Clear the entry whenever a new error arrives (state adjusted during render).
  const [seenError, setSeenError] = useState(error);
  if (error !== seenError) {
    setSeenError(error);
    if (error) setPin("");
  }

  const press = (d: string) => {
    if (busy) return;
    const next = (pin + d).slice(0, length);
    setPin(next);
    if (next.length === length) onSubmit(next);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      if (e.key === "Backspace") setPin((p) => p.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="mx-auto max-w-xs text-center">
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="my-6 flex justify-center gap-3" aria-label={`${pin.length} of ${length}`}>
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full transition ${i < pin.length ? "bg-green" : "bg-line"}`}
          />
        ))}
      </div>
      <p role="alert" className="mb-3 min-h-5 text-sm text-danger">
        {error}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <Key key={d} onClick={() => press(d)}>
            {d}
          </Key>
        ))}
        <span />
        <Key onClick={() => press("0")}>0</Key>
        <Key onClick={() => setPin((p) => p.slice(0, -1))} label="Delete">
          <Delete className="h-5 w-5" />
        </Key>
      </div>
    </div>
  );
}

function Key({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-16 place-items-center rounded-full bg-card font-display text-2xl font-semibold text-ink transition active:scale-95 active:bg-card-2"
    >
      {children}
    </button>
  );
}
