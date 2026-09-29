"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { SiteMessages } from "@/messages/site";

type State = "idle" | "sending" | "success" | "error";

const field =
  "mt-2 block min-h-12 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-ink placeholder:text-muted focus:border-green";

export function ContactForm({
  locale,
  t,
  orgTypes,
  volumes,
  countries,
}: {
  locale: Locale;
  t: SiteMessages["contact"]["form"];
  orgTypes: SiteMessages["contact"]["orgTypes"];
  volumes: SiteMessages["contact"]["volumes"];
  countries: readonly { code: string; name: string }[];
}) {
  const [state, setState] = useState<State>("idle");
  const [emailError, setEmailError] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const email = get("email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(true);
      (form.elements.namedItem("email") as HTMLInputElement | null)?.focus();
      return;
    }
    setEmailError(false);
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: get("name"),
          email,
          organisation: get("organisation"),
          organisationType: get("organisationType"),
          country: get("country"),
          monthlyVolume: get("monthlyVolume"),
          message: get("message"),
          locale,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div role="status" className="rounded-3xl border border-line bg-card p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green" aria-hidden />
        <h2 className="mt-4 font-display text-2xl font-extrabold text-navy">{t.successTitle}</h2>
        <p className="mt-2 text-muted">{t.successBody}</p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 inline-flex min-h-12 items-center rounded-full border border-line bg-card px-6 text-sm font-bold text-navy hover:bg-card-2"
        >
          {t.another}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-3xl border border-line bg-card p-6 sm:p-8">
      {state === "error" && (
        <div role="alert" className="flex gap-3 rounded-2xl bg-danger-soft p-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="font-bold">{t.errorTitle}</p>
            <p>{t.errorBody}</p>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-navy">
          {t.name}
          <input name="name" type="text" required autoComplete="name" className={field} />
        </label>
        <label className="block text-sm font-semibold text-navy">
          {t.email}
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            aria-invalid={emailError}
            aria-describedby={emailError ? "email-error" : undefined}
            className={field}
          />
          {emailError && (
            <span id="email-error" role="alert" className="mt-1 block text-sm font-normal text-danger">
              {t.invalidEmail}
            </span>
          )}
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-navy">
          {t.organisation}
          <input name="organisation" type="text" required autoComplete="organization" className={field} />
        </label>
        <label className="block text-sm font-semibold text-navy">
          {t.organisationType}
          <select name="organisationType" required defaultValue="" className={field}>
            <option value="" disabled>
              {t.choose}
            </option>
            {orgTypes.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-navy">
          {t.country}
          <select name="country" required defaultValue="" className={field}>
            <option value="" disabled>
              {t.choose}
            </option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-navy">
          {t.volume}
          <select name="monthlyVolume" defaultValue="" className={field}>
            <option value="" disabled>
              {t.choose}
            </option>
            {volumes.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-semibold text-navy">
        {t.message}
        <textarea name="message" rows={5} className={field} />
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">{t.privacy}</p>
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-green px-7 text-sm font-bold text-on-accent hover:bg-green-strong disabled:opacity-70"
        >
          {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {state === "sending" ? t.sending : t.submit}
        </button>
      </div>
    </form>
  );
}
