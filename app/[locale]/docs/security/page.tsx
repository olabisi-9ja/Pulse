import Link from "next/link";
import { C, Callout, DataTable, EnglishOnly, H2, P, PageHeader, Ul } from "@/components/docs/ui";
import { docsMetadata, docsPage } from "../_lib";

export async function generateMetadata({ params }: PageProps<"/[locale]/docs/security">) {
  return docsMetadata(params, "security");
}

export default async function SecurityPage({ params }: PageProps<"/[locale]/docs/security">) {
  const { locale, t } = await docsPage(params);
  const c = t.security;
  const s = t.shell;
  return (
    <article>
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      {locale === "fr" && <EnglishOnly text={s.englishOnly} />}

      <Callout tone="warn" title="Double-spending is bounded, not impossible">
        A device that is offline cannot ask anyone whether money has already been spent. PayVault does not pretend
        otherwise. It bounds how much can be lost, detects every double-spend when the payments reach the server, and
        recovers the loss from the KYC&apos;d holder, with a risk pool as the backstop.
      </Callout>

      <H2 id="model">The model</H2>
      <Ul>
        <li>
          <strong>Bounded.</strong> The allowance certificate fixes a cap (funded plus credit), a per-payment limit, a
          maximum number of payments and an expiry. Country packs and KYC tiers keep those numbers low.
        </li>
        <li>
          <strong>Detected.</strong> Every payment carries a sequence number, a running total and the hash of the previous
          payment. Two payments that claim the same place in the chain are a fork, and settlement flags it.
        </li>
        <li>
          <strong>Recovered.</strong> A detected fraud revokes the allowance, opens a fraud case and emits{" "}
          <C>fraud.detected</C>. Any shortfall is taken from the holder&apos;s wallet before the risk pool.
        </li>
      </Ul>

      <H2 id="threats">Threat model</H2>
      <DataTable
        head={["Threat", "Mitigation"]}
        caption="Threats and mitigations"
        rows={[
          ["Same allowance spent twice at different merchants", "Low caps; fork detection at settlement; revocation; recovery from the holder, then the risk pool"],
          ["Replay to the same merchant", "One-time request nonce, and the merchant rejects payments it already holds"],
          ["Replay to a different merchant", "Every payment is signed over the merchant ID"],
          ["Counter rollback on the device", "The hash chain turns a rollback into a fork"],
          ["Payment forged by a merchant", "Needs the payer's device private key"],
          ["Forged allowance", "Needs the partner's issuer private key; merchants check it against cached issuer keys"],
          ["Stolen unlocked phone", "PIN before signing; limited remaining allowance; the allowance can be revoked"],
          ["Revoked or expired allowance", "Checked offline against the last synced list and the certificate's expiry. Risk inside the sync window is accepted and bounded"],
          ["Device clock set wrong", "Device clocks are not trusted; merchants allow 5 minutes of skew, and payments are ordered by sequence number, not time"],
        ]}
      />

      <H2 id="offline-checks">What a merchant checks offline</H2>
      <P>
        <C>verifyBundle</C> runs on the merchant&apos;s device with no network. It rejects a payment if any of these fail:
      </P>
      <Ul>
        <li>The issuer key is known and the allowance signature is valid.</li>
        <li>The allowance is inside its validity window and not on the cached revocation list.</li>
        <li>The payer&apos;s signature is valid for the device key named in the allowance.</li>
        <li>The payment names this merchant and answers this request (nonce, amount, currency).</li>
        <li>The amount is within the per-payment limit, the running total within the cap, and the count within the maximum.</li>
        <li>The payment links correctly to the ones this merchant already holds from the same allowance, with no fork.</li>
      </Ul>
      <P>
        A merchant only sees its own payments. A double-spend across two merchants passes both offline checks and is caught
        at settlement. That is the bounded risk.
      </P>

      <H2 id="keys">How keys are held</H2>
      <DataTable
        head={["Key", "Where it lives today"]}
        caption="Key storage in the reference implementation"
        rows={[
          ["Payer device key (ECDSA P-256)", "Generated in the browser as a non-extractable WebCrypto key and stored in IndexedDB. It can sign but cannot be exported"],
          ["App PIN", "Never stored. PBKDF2-SHA-256 with 150,000 iterations and a random salt. Five wrong tries lock signing for five minutes"],
          ["Partner issuer keys (ECDSA P-256)", "On the server, encrypted at rest with AES-256-GCM under `PV_MASTER_KEY`"],
          ["Partner API keys", "Shown once as `pv_<prefix>_<secret>`. Only a SHA-256 hash of the secret is stored, compared in constant time"],
          ["Webhook secret", "Used to sign each delivery with HMAC-SHA-256"],
        ]}
      />
      <P>
        See <Link href={`/${locale}/docs/webhooks`} className="font-semibold text-green underline">Webhooks</Link> for how to
        verify signatures.
      </P>

      <H2 id="limits">Known limits of the reference implementation</H2>
      <P>The reference wallet is a web app. That is useful for pilots and has limits a native SDK will remove:</P>
      <Ul>
        <li>
          A browser does not guarantee that a non-extractable key is backed by secure hardware, and it offers no device
          attestation. Code running in the wallet&apos;s origin can ask the key to sign.
        </li>
        <li>The PIN gates the wallet&apos;s signing flow. It is not bound into the key itself.</li>
        <li>The offline queue in IndexedDB is not encrypted beyond what the operating system provides.</li>
        <li>Issuer keys are sealed with a single master key. Production deployments should move them to a KMS or HSM.</li>
        <li>
          Development shortcuts (email sign-in without Supabase, a fixed master key) are refused when{" "}
          <C>NODE_ENV</C> is <C>production</C>.
        </li>
        <li>No independent security audit has been completed yet.</li>
      </Ul>

      <Callout tone="note" title="Custody">
        PayVault does not hold customer funds. Value sits in the partner&apos;s ledger, and the allowance only authorises
        spending it offline. Read the{" "}
        <Link href={`/${locale}/security`} className="font-semibold underline">
          security overview
        </Link>{" "}
        for the non-technical summary.
      </Callout>
    </article>
  );
}
