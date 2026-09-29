import { Code } from "@/components/docs/Code";
import { C, Callout, DataTable, EnglishOnly, H2, P, PageHeader, Ul } from "@/components/docs/ui";
import { docsMetadata, docsPage } from "../_lib";

export async function generateMetadata({ params }: PageProps<"/[locale]/docs/overdraft">) {
  return docsMetadata(params, "overdraft");
}

const EXAMPLE = `Country pack (Nigeria, concept)   allowanceCap = 5,000,000 minor  (NGN 50,000)
Credit ceiling                    40% of cap             = 2,000,000 minor  (NGN 20,000)

Customer: tier1 (standard KYC), account 28 days old, 2 loans repaid on time,
          20 settled payments, no late loans, no fraud, nothing overdue

score = 30 (tier1) + 4 (28 days / 7) + 12 (2 x 6) + 4 (20 / 5) = 50
limit = floor(2,000,000 x 0.5 (tier1 share) x 50 / 100) = 500,000 minor   (NGN 5,000)

Vault: funded 1,000,000 + credit 500,000  ->  offline cap 1,500,000
Payments total 1,300,000 -> 1,000,000 from funded, 300,000 from credit (a drawdown)

Fee, partner at 200 bps: ceil(300,000 x 200 / 10,000) = 6,000 minor  (NGN 60)
Owed: 306,000 minor, due 14 days after the first draw on this vault`;

export default async function OverdraftPage({ params }: PageProps<"/[locale]/docs/overdraft">) {
  const { locale, t } = await docsPage(params);
  const c = t.overdraft;
  const s = t.shell;
  const cp = { copyLabel: s.copy, copiedLabel: s.copied };
  return (
    <article>
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      {locale === "fr" && <EnglishOnly text={s.englishOnly} />}

      <Callout tone="warn" title="Illustrative policy">
        The numbers on this page come from the default policy in the reference implementation and from concept-stage
        country packs. They show how the mechanism works. A real partner sets its own credit policy, subject to its
        regulator.
      </Callout>

      <H2 id="how">How it works</H2>
      <P>
        A customer can ask for an overdraft line when they load an offline vault. The line is part of the signed
        allowance (<C>credit</C>), so merchants see one spending cap, <C>funded + credit</C>, and do not need to know
        which part is which.
      </P>
      <Ul>
        <li>Spending draws the funded part first. Only the amount above it is an overdraft drawdown.</li>
        <li>
          When the payment reaches PayVault, the drawdown creates or increases one loan for that allowance and emits{" "}
          <C>loan.drawn</C>. The merchant is paid in full regardless.
        </li>
        <li>Unspent overdraft simply lapses. No fee is charged on credit that was not used.</li>
      </Ul>

      <H2 id="limits">Limits</H2>
      <P>
        Three things bound an overdraft: the country ceiling, the customer&apos;s KYC tier and their history.
      </P>
      <DataTable
        head={["Rule", "Value"]}
        caption="Overdraft limit rules"
        rows={[
          ["Country ceiling", "40% of the pack's `allowanceCap`"],
          ["Tier 0 (phone number only)", "No overdraft. Lending needs identity verification"],
          ["Tier 1 (standard KYC)", "Half of the ceiling, scaled by score"],
          ["Tier 2 (full KYC)", "The whole ceiling, scaled by score"],
          ["Any fraud case on the account", "No overdraft, and the credit profile is frozen"],
          ["Any overdue loan", "No overdraft until it is repaid"],
          ["Rounding", "Limits are rounded down to a whole major unit"],
          ["Available now", "Limit, minus loans outstanding, minus credit reserved in open vaults"],
        ]}
      />
      <P>
        The funded side has its own ceiling: a tier&apos;s share of the pack&apos;s <C>allowanceCap</C>. With the standard
        ladder that is 20%, 60% and 100% for tiers 0, 1 and 2.
      </P>

      <H2 id="score">Score</H2>
      <P>The score runs from 0 to 100 and scales the limit. It is recomputed each time the customer&apos;s overdraft availability is checked.</P>
      <DataTable
        head={["Component", "Points"]}
        caption="Credit score components"
        rows={[
          ["Base, tier 1", "30"],
          ["Base, tier 2", "45"],
          ["Account age", "1 per full week, up to 15"],
          ["Loans repaid on time", "6 each, up to 30"],
          ["Settled offline payments", "1 per 5, up to 10"],
          ["Loans repaid late", "minus 10 each"],
        ]}
      />
      <Code label="Worked example" code={EXAMPLE} {...cp} />

      <H2 id="fees">Fees and term</H2>
      <Ul>
        <li>
          The fee is set by the partner in basis points of the amount drawn, rounded up to the next minor unit. The
          default is 200 bps (2%), and the range is 0 to 5,000 bps.
        </li>
        <li>
          The term is set by the partner, 1 to 90 days, default 14, counted from the first draw on the allowance. A later
          draw on the same allowance adds to the same loan; the due date does not move.
        </li>
        <li>
          Fees are on drawdowns only, never on funded spending. The fee is fixed when the payment settles.
        </li>
      </Ul>

      <H2 id="repayment">Repayment</H2>
      <Ul>
        <li>
          <strong>Automatic:</strong> on hosted ledgers, whenever money arrives in the customer&apos;s wallet (a top-up, an
          incoming transfer, merchant earnings moved to the wallet), open loans are repaid from it, oldest first.
        </li>
        <li>
          <strong>On demand:</strong> the customer can repay part or all at any time.
        </li>
        <li>
          <strong>Overdue:</strong> a scheduled job marks loans past their due date as overdue. That blocks new overdraft.
          Collection and write-off policy belong to the partner.
        </li>
        <li>
          <strong>External ledgers:</strong> PayVault records the loan and emits <C>loan.drawn</C>. You book and collect the
          repayment in your own system.
        </li>
      </Ul>

      <H2 id="lender">Who lends</H2>
      <P>
        The partner is the lender of record. It extends the credit, holds the receivable, carries the credit risk and is
        the party the regulator sees. PayVault computes the offline mechanics (the cap, the drawdown, the loan record and
        the events) and, in the reference implementation, an illustrative scoring policy. PayVault does not lend its own
        money and does not hold a lending licence.
      </P>
      <Callout tone="note" title="Overdraft is not the guarantee">
        The merchant guarantee is about the payment being honoured. The overdraft is about who fronted the money behind
        it. If a customer never repays an overdraft, that is the partner&apos;s credit loss. If a customer double-spends
        beyond the cap, that is a fraud loss covered by the risk pool. They are different risks.
      </Callout>
    </article>
  );
}
