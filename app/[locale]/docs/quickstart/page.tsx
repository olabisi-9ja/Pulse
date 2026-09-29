import { Code } from "@/components/docs/Code";
import { C, Callout, EnglishOnly, H2, P, PageHeader, Ul } from "@/components/docs/ui";
import { docsMetadata, docsPage } from "../_lib";

export async function generateMetadata({ params }: PageProps<"/[locale]/docs/quickstart">) {
  return docsMetadata(params, "quickstart");
}

const ENV = `export PAYVAULT_URL="https://<your-payvault-host>"
export PAYVAULT_KEY="pv_a1b2c3d4e5f6_<secret shown once in the console>"`;

const DEVICE_KEY = `import { generateKeyPair, exportPublicKey, toHex } from "@payvault/protocol";

// ECDSA P-256. The private key is non-extractable; store the CryptoKeyPair
// in IndexedDB (it can be stored, but never read out).
const deviceKeys = await generateKeyPair();
const devicePublicKey = toHex(await exportPublicKey(deviceKeys.publicKey)); // 66 hex chars

// Send devicePublicKey to your backend, authenticated as your customer.`;

const ISSUE = `curl -sS -X POST "$PAYVAULT_URL/api/v1/allowances" \\
  -H "Authorization: Bearer $PAYVAULT_KEY" \\
  -H "content-type: application/json" \\
  -d '{
    "devicePublicKey": "02c4f1...e9",
    "country": "NG",
    "funded": 500000,
    "credit": 0,
    "externalRef": "cust_8123_vault_1",
    "ttlHours": 72
  }'

# 201 Created
{
  "id": "9f2c1e5b7a3d4c08b6e1a2d3f4c5b6a7",
  "cert": "AQEAn8sc63...",
  "issuerKid": 3,
  "currency": "NGN",
  "funded": 500000,
  "credit": 0,
  "perTxLimit": 1500000,
  "expiresAt": "2026-10-02T09:30:00.000Z"
}`;

const HOLD = `import { decodeAllowance, fromBase64Url, initWalletState } from "@payvault/protocol";

const cert = decodeAllowance(fromBase64Url(response.cert));
let state = await initWalletState(cert); // { cert, seq: 0, cumulative: 0, lastHash: genesis }
await saveState(state);                  // your storage (IndexedDB, SQLite...)`;

const SNAPSHOT = `import { fromHex, importPublicKey } from "@payvault/protocol";

// Public endpoint. Call it whenever you have signal and cache the result.
const net = await (await fetch(\`\${BASE}/api/network\`)).json();

const issuerKeys = new Map<number, CryptoKey>();
for (const k of net.issuerKeys) issuerKeys.set(k.kid, await importPublicKey(fromHex(k.publicKey)));
const revoked = new Set<string>(net.revocations.map((r) => r.allowanceId));`;

const PAY = `import { bundleToQr, createRequest, parseQr, requestToQr, signPayment } from "@payvault/protocol";

// MERCHANT: ask for 2,500.00 NGN (minor units).
const request = createRequest(merchantId, 250000, "NGN", "Mama Ade Stores");
showQr(requestToQr(request)); // "PV" + base45

// PAYER: scan the request, sign, persist, then show the bundle.
const scanned = parseQr(scannedText);
if (scanned.kind !== "request") throw new Error("Not a payment request");
const { payment, state: next } = await signPayment(deviceKeys.privateKey, state, scanned.request);
await saveState(next);                       // persist BEFORE showing the QR
state = next;
showQr(bundleToQr({ cert: state.cert, payment }));`;

const VERIFY = `import { encodeBundle, parseQr, toBase64Url, verifyBundle } from "@payvault/protocol";

// MERCHANT: scan the bundle and verify it with no network.
const scanned = parseQr(scannedText);
if (scanned.kind !== "bundle") throw new Error("Not a payment bundle");

const result = await verifyBundle(scanned.bundle, {
  issuerKey: (kid) => issuerKeys.get(kid),
  isRevoked: (allowanceIdHex) => revoked.has(allowanceIdHex),
  merchantId,                                  // your 8-byte merchant id
  request,                                     // the request you displayed
  isNonceUsed: (nonceHex) => usedNonces.has(nonceHex),
});

if (!result.ok) {
  showRejected(result.code);                   // e.g. "expired", "over_cap", "fork"
} else {
  // Persist before handing over goods. This is the outbox you sync later.
  await outbox.add(result.id, toBase64Url(encodeBundle(scanned.bundle)));
  showAccepted(result.payment.amount);
}`;

const SYNC = `curl -sS -X POST "$PAYVAULT_URL/api/v1/payments/sync" \\
  -H "Authorization: Bearer $PAYVAULT_KEY" \\
  -H "content-type: application/json" \\
  -d '{ "bundles": ["AQQBAZ...", "AQQBAY..."] }'

# 200 OK
{
  "results": [
    {
      "id": "5d0e...c1",
      "allowanceId": "9f2c1e5b7a3d4c08b6e1a2d3f4c5b6a7",
      "status": "settled",
      "amount": 250000,
      "currency": "NGN",
      "merchantUserId": null,
      "payerUserId": null
    },
    { "status": "rejected", "code": "cert_mismatch", "allowanceId": "9f2c..." }
  ]
}`;

const EVENTS = `curl -sS "$PAYVAULT_URL/api/v1/events?after=0&limit=100" \\
  -H "Authorization: Bearer $PAYVAULT_KEY"

{
  "data": [
    { "id": 41, "type": "payment.settled", "createdAt": "2026-09-29T10:02:11.000Z",
      "data": { "paymentId": "5d0e...c1", "allowanceId": "9f2c...", "amount": 250000,
                "currency": "NGN", "merchantId": "a1b2c3d4e5f60718", "seq": 1,
                "fromFunded": 250000, "fromCredit": 0, "fromRiskPool": 0 } }
  ],
  "nextAfter": 41
}`;

export default async function QuickstartPage({ params }: PageProps<"/[locale]/docs/quickstart">) {
  const { locale, t } = await docsPage(params);
  const c = t.quickstart;
  const s = t.shell;
  return (
    <article>
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      {locale === "fr" && <EnglishOnly text={s.englishOnly} />}

      <Callout title="Before you start">
        You need an external-ledger partner account. Hosted-ledger partners issue vaults through the reference app and get
        a <C>409 hosted_partner</C> from <C>POST /api/v1/allowances</C>. The examples use TypeScript and curl, and amounts are
        always integers in minor units.
      </Callout>

      <H2 id="step-1">1. Create an API key</H2>
      <P>
        In the partner console, open the API keys section and create a key. The full key is shown once. It looks like{" "}
        <C>pv_a1b2c3d4e5f6_&lt;secret&gt;</C>: a fixed <C>pv_</C> prefix, 12 hex characters that identify the key, and the
        secret. PayVault stores only a hash of the secret. Keep the key on your server; never put it in an app.
      </P>
      <Code label="shell" code={ENV} copyLabel={s.copy} copiedLabel={s.copied} />

      <H2 id="step-2">2. Give each device a key</H2>
      <P>
        Each customer device generates its own ECDSA P-256 key pair. The public key is 33 bytes when compressed, which is
        66 hex characters, and it is the only thing your backend needs.
      </P>
      <Code label="device (TypeScript)" code={DEVICE_KEY} copyLabel={s.copy} copiedLabel={s.copied} />

      <H2 id="step-3">3. Lock funds, then issue the allowance</H2>
      <P>
        Lock <C>funded</C> (and approve any <C>credit</C>) in your own ledger first, then ask PayVault to sign the
        certificate. PayVault does not move money in external-ledger mode: it signs, tracks and reconciles. The response
        carries the certificate as base64url.
      </P>
      <Code label="POST /api/v1/allowances" code={ISSUE} copyLabel={s.copy} copiedLabel={s.copied} />
      <Ul>
        <li>
          <C>funded + credit</C> must be above zero and at most the country pack&apos;s offline cap, or you get{" "}
          <C>over_limit</C>.
        </li>
        <li>
          The per-payment limit and payment count come from the country pack. <C>ttlHours</C> can shorten the default
          expiry but not extend it.
        </li>
        <li>
          <C>externalRef</C> is your own reference (for example your vault id). It comes back in reads, payments and
          events. The request is not deduplicated, so store the response rather than retrying blindly.
        </li>
      </Ul>

      <H2 id="step-4">4. The device holds the certificate</H2>
      <P>Send the certificate to the device. It decodes it and creates its wallet state, which it must persist after every payment.</P>
      <Code label="device (TypeScript)" code={HOLD} copyLabel={s.copy} copiedLabel={s.copied} />

      <H2 id="step-5">5. The merchant verifies, offline</H2>
      <P>
        Merchant devices cache the issuer keys and revocation list from the public network snapshot whenever they have
        signal. After that, the sequence below needs no network at all.
      </P>
      <Code label="merchant (TypeScript)" code={SNAPSHOT} copyLabel={s.copy} copiedLabel={s.copied} />
      <Code label="request and payment" code={PAY} copyLabel={s.copy} copiedLabel={s.copied} />
      <Code label="merchant (TypeScript)" code={VERIFY} copyLabel={s.copy} copiedLabel={s.copied} />
      <Callout tone="note" title="Merchant ids">
        A merchant id is 8 bytes that you assign to each merchant (for example with <C>randomBytes(8)</C>) and keep in your
        own records. In external-ledger mode PayVault does not need to know it in advance; it only has to match between
        the request and the payment.
      </Callout>

      <H2 id="step-6">6. Sync and reconcile</H2>
      <P>
        When a merchant, payer or courier has signal, upload the outbox. Up to 500 bundles go in one call and each is
        settled in its own transaction. Uploading a bundle twice is safe: the second result has{" "}
        <C>status: &quot;duplicate&quot;</C>.
      </P>
      <Code label="POST /api/v1/payments/sync" code={SYNC} copyLabel={s.copy} copiedLabel={s.copied} />
      <P>
        Each result is <C>settled</C>, <C>flagged</C> (the payment is honoured but implicated in a fork, broken chain or
        overspend), <C>duplicate</C> or <C>rejected</C> with a <C>code</C>. The full list of codes is in the API
        reference.
      </P>

      <H2 id="step-7">7. Consume events</H2>
      <P>
        Every settlement, revocation, closure and overdraft movement produces an event. Configure a webhook to receive
        them with a signature you can verify, or poll the events feed. Settle the merchant in your ledger from{" "}
        <C>payment.settled</C>, using <C>fromFunded</C>, <C>fromCredit</C> and <C>fromRiskPool</C> to book the source.
      </P>
      <Code label="GET /api/v1/events" code={EVENTS} copyLabel={s.copy} copiedLabel={s.copied} />

      <H2 id="close">Optional: cash out early</H2>
      <P>
        To let a customer release unspent value before expiry, have the device call <C>signClose</C> and send the encoded
        statement to your backend, which posts it to <C>POST /api/v1/allowances/close</C>. Unspent funded value is
        yours to release in your ledger; the declared cumulative tells you how much was spent, and an{" "}
        <C>allowance.closed</C> event fires when every declared payment has arrived.
      </P>
    </article>
  );
}
