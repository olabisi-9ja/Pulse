"use client";
import { countryPacks } from "@payvault/countries";
import { useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { api, ApiError } from "@/lib/client/api";
import { useI18n } from "./I18n";
import { Button, Field, Select } from "./ui";

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { m, locale } = useI18n();
  const [name, setName] = useState("");
  const [country, setCountry] = useState(locale === "fr" ? "SN" : "NG");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sorted = [...countryPacks].sort((a, b) => a.name[locale].localeCompare(b.name[locale], locale));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/app/onboard", { displayName: name, country, locale });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : m.common.needsNetwork);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-5 px-4 py-10">
      <LogoMark className="h-12 w-12" />
      <h1 className="text-[26px] font-medium tracking-tight text-ink">{m.onboarding.title}</h1>
      <Field label={m.onboarding.name} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      <Select label={m.onboarding.country} hint={m.onboarding.countryHint} value={country} onChange={(e) => setCountry(e.target.value)}>
        {sorted.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name[locale]} ({p.currency.code})
          </option>
        ))}
      </Select>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={busy} disabled={!name.trim()}>
        {m.onboarding.create}
      </Button>
    </form>
  );
}
