import { countryPacks, formatMinor } from "@payvault/countries";
import { C, Callout, DataTable, EnglishOnly, H2, P, PageHeader, Ul } from "@/components/docs/ui";
import { docsMetadata, docsPage } from "../_lib";

export async function generateMetadata({ params }: PageProps<"/[locale]/docs/countries">) {
  return docsMetadata(params, "countries");
}

const RESIDENCY: Record<string, string> = { none: "none", preferred: "preferred", required: "required" };

export default async function CountriesPage({ params }: PageProps<"/[locale]/docs/countries">) {
  const { locale, t } = await docsPage(params);
  const c = t.countries;
  const s = t.shell;

  const rows = [...countryPacks]
    .sort((a, b) => a.name.en.localeCompare(b.name.en))
    .map((p) => [
      p.code,
      p.name[locale],
      p.currency.code,
      formatMinor(p.offlineLimits.perTransaction, p.currency.code, "en"),
      formatMinor(p.offlineLimits.allowanceCap, p.currency.code, "en"),
      `${p.offlineLimits.allowanceTtlHours} h`,
      p.rails.domestic.map((r) => r.name).join(", "),
      `${p.dataProtection.law} (residency: ${RESIDENCY[p.dataProtection.residency]})`,
      p.status,
    ]);

  return (
    <article>
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      {locale === "fr" && <EnglishOnly text={s.englishOnly} />}

      <Callout tone="warn" title="Concept status, illustrative limits">
        Every pack below is marked <C>concept</C>. Limits are placeholders chosen to be plausible for low-value offline
        payments, not values agreed with any regulator or central bank. Do not treat them as legal or regulatory guidance.
      </Callout>

      <H2 id="table">Packs</H2>
      <P>
        This table is generated from the <C>countryPacks</C> export of <C>@payvault/countries</C>, so it always matches the
        code. Amounts are shown in major units.
      </P>
      <DataTable
        head={["Code", "Country", "Currency", "Per payment", "Allowance cap", "TTL", "Domestic rails", "Data law", "Status"]}
        caption="Country packs"
        mono={[0, 2, 3, 4, 5, 8]}
        rows={rows}
      />

      <H2 id="what">What a pack sets</H2>
      <Ul>
        <li>
          <C>offlineLimits</C>: <C>perTransaction</C>, <C>allowanceCap</C> (the most that can be locked, plus credit, in one
          allowance), <C>allowanceTtlHours</C>, <C>maxPaymentsPerAllowance</C> and <C>releaseGraceHours</C>. All amounts are
          integers in minor units.
        </li>
        <li>
          <C>kyc</C>: the tier ladder, each tier with an <C>allowanceCapMultiplier</C> between 0 and 1, and the national ID
          systems accepted.
        </li>
        <li>
          <C>rails</C>: domestic rails by type (instant, RTGS, mobile money, card, ACH) and cross-border options.
        </li>
        <li>
          <C>dataProtection</C>: the data-protection law, the authority, and whether residency is none, preferred or
          required.
        </li>
        <li>
          <C>currency</C>, <C>languages</C>, <C>phone</C>, <C>centralBank</C> and a bilingual <C>notes</C> field.
        </li>
      </Ul>

      <H2 id="use">How packs are used</H2>
      <P>
        Issuing an allowance copies its currency, per-payment limit, maximum payment count and expiry from the pack into the
        signed certificate, so merchants enforce the limits offline without asking anyone. External-ledger issuance also
        rejects <C>funded + credit</C> above the pack&apos;s cap. Adding a market is a data change validated by a schema at
        load time, not new code.
      </P>
      <P>
        A pack&apos;s <C>releaseGraceHours</C> is part of the schema. The current sweep that returns unspent vault value
        uses a fixed 24-hour grace period.
      </P>
    </article>
  );
}
