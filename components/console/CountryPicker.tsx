import { listCountries } from "@payvault/countries";
import type { Locale } from "@/lib/i18n";

/** Server-rendered checkbox grid; submit values are read by ApiForm (list field "countries"). */
export function CountryPicker({ locale, selected = [], name = "countries" }: { locale: Locale; selected?: string[]; name?: string }) {
  const chosen = new Set(selected.map((c) => c.toUpperCase()));
  const countries = listCountries()
    .map((c) => ({ ...c, label: c.name[locale] }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
  return (
    <fieldset className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-line bg-card p-2 sm:grid-cols-2 lg:grid-cols-3">
      {countries.map((c) => (
        <label key={c.code} className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm text-ink hover:bg-card-2">
          <input type="checkbox" name={name} value={c.code} defaultChecked={chosen.has(c.code)} className="h-4 w-4 accent-[var(--pv-green)]" />
          <span className="truncate">{c.label}</span>
          <span className="ml-auto text-xs text-muted">{c.currencyCode}</span>
        </label>
      ))}
    </fieldset>
  );
}
