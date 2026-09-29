import { Code } from "@/components/docs/Code";
import { C, Callout, DataTable, EnglishOnly, Endpoint, H2, H3, P, PageHeader, Ul } from "@/components/docs/ui";
import { docsMetadata, docsPage } from "../_lib";

export async function generateMetadata({ params }: PageProps<"/[locale]/docs/api">) {
  return docsMetadata(params, "api");
}

const AUTH = `curl -sS "$PAYVAULT_URL/api/v1/network" \\
  -H "Authorization: Bearer pv_a1b2c3d4e5f6_Zx9...secret"`;

const ERR = `HTTP/1.1 400
{
  "error": {
    "code": "invalid_request",
    "message": "devicePublicKey: invalid hex"
  }
}`;

const NETWORK = `GET /api/network?since=1790000000

200 OK
{
  "issuerKeys": [
    { "kid": 3, "partnerId": "0b7c...", "publicKey": "02c4f1...e9", "status": "active" },
    { "kid": 2, "partnerId": "0b7c...", "publicKey": "03a91d...07", "status": "retired" }
  ],
  "revocations": [
    { "allowanceId": "9f2c1e5b7a3d4c08b6e1a2d3f4c5b6a7", "at": "2026-09-28T14:02:11.000Z" }
  ],
  "serverTime": 1790012345
}`;

const ISSUE_REQ = `POST /api/v1/allowances
Authorization: Bearer pv_...
Content-Type: application/json

{
  "devicePublicKey": "02c4f1...e9",   // 66 hex chars, compressed P-256
  "country": "NG",                    // must be a supported country pack
  "funded": 500000,                   // minor units, >= 0
  "credit": 0,                        // minor units, >= 0 (default 0)
  "externalRef": "cust_8123_vault_1", // 1..100 chars
  "ttlHours": 72                      // optional, 1..720, capped by the pack TTL
}`;

const ISSUE_RES = `201 Created
{
  "id": "9f2c1e5b7a3d4c08b6e1a2d3f4c5b6a7",
  "cert": "AQEAn8sc63...",            // base64url of the 146-byte certificate
  "issuerKid": 3,
  "currency": "NGN",
  "funded": 500000,
  "credit": 0,
  "perTxLimit": 1500000,
  "expiresAt": "2026-10-02T09:30:00.000Z"
}`;

const GET_RES = `200 OK
{
  "id": "9f2c1e5b7a3d4c08b6e1a2d3f4c5b6a7",
  "externalRef": "cust_8123_vault_1",
  "status": "active",                 // active | closing | closed | revoked
  "currency": "NGN",
  "funded": 500000,
  "credit": 0,
  "settled": { "funded": 250000, "credit": 0, "riskPool": 0, "payments": 1 },
  "refunded": 0,
  "declared": null,                   // or { "seq": 4, "cumulative": 180000 } after a close statement
  "expiresAt": "2026-10-02T09:30:00.000Z",
  "fraudCases": [
    {
      "kind": "fork",                 // fork | chain_break | overspend | after_close
      "seq": 3,
      "loss": 0,
      "status": "open",               // open | recovered | written_off
      "paymentIds": ["5d0e...c1", "77ab...09"],
      "createdAt": "2026-09-29T10:04:00.000Z"
    }
  ]
}`;

const REVOKE = `POST /api/v1/allowances/9f2c1e5b7a3d4c08b6e1a2d3f4c5b6a7/revoke
{ "reason": "device_reported_lost" }     // optional, 1..100 chars, default "partner_request"

200 OK
{ "id": "9f2c1e5b7a3d4c08b6e1a2d3f4c5b6a7", "status": "revoked" }`;

const CLOSE = `POST /api/v1/allowances/close
{ "close": "AQUp..." }                   // base64url of the 92-byte close statement

200 OK
{
  "id": "9f2c1e5b7a3d4c08b6e1a2d3f4c5b6a7",
  "status": "closing",                   // "closed" once every declared payment has arrived
  "declared": { "seq": 4, "cumulative": 180000 }
}`;

const SYNC_REQ = `POST /api/v1/payments/sync
{ "bundles": ["AQQBAZ...", "AQQBAY..."] }   // 1..500 base64url bundles (276 bytes each)`;

const SYNC_RES = `200 OK
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
    { "id": "5d0e...c1", "allowanceId": "9f2c...", "status": "duplicate", "code": "settled" },
    { "allowanceId": "9f2c...", "status": "rejected", "code": "over_cap" },
    { "status": "rejected", "code": "decode" }
  ]
}`;

const PAYMENTS = `GET /api/v1/payments?limit=50&before=2026-09-29T10:00:00.000Z

200 OK
{
  "data": [
    {
      "id": "5d0e...c1",
      "allowanceId": "9f2c1e5b7a3d4c08b6e1a2d3f4c5b6a7",
      "externalRef": "cust_8123_vault_1",
      "seq": 1,
      "amount": 250000,
      "currency": "NGN",
      "merchantId": "a1b2c3d4e5f60718",
      "fromFunded": 250000,
      "fromCredit": 0,
      "fromRiskPool": 0,
      "status": "settled",             // settled | flagged
      "receivedVia": "merchant",       // merchant | payer | courier | api
      "deviceTime": "2026-09-29T09:58:40.000Z",
      "receivedAt": "2026-09-29T10:02:11.000Z"
    }
  ],
  "nextBefore": null                   // pass as ?before= for the next page, or null at the end
}`;

const EVENTS = `GET /api/v1/events?after=40&limit=100

200 OK
{
  "data": [
    { "id": 41, "type": "payment.settled", "createdAt": "2026-09-29T10:02:11.000Z", "data": { "...": "..." } }
  ],
  "nextAfter": 41
}`;

const ERROR_ROWS: string[][] = [
  ["unauthorized", "401", "Missing, malformed or revoked API key, or the partner is suspended"],
  ["bad_json", "400", "The body is not valid JSON"],
  ["invalid_request", "400", "A field failed validation. The message names the first offending field"],
  ["hosted_partner", "409", "`POST /api/v1/allowances` on a hosted-ledger partner"],
  ["over_limit", "400", "`funded + credit` is above the country pack's offline cap"],
  ["not_found", "404", "Unknown allowance, or one that belongs to another partner"],
  ["forbidden", "403", "The allowance belongs to another partner (close)"],
  ["decode", "400", "The close statement could not be decoded"],
  ["bad_signature", "400", "The close statement signature does not match the allowance's device key"],
  ["internal", "500", "Unexpected error. Safe to retry reads"],
];

const REJECT_ROWS: string[][] = [
  ["decode", "The bytes are not a valid bundle"],
  ["unknown_allowance", "No allowance with that id was issued by PayVault"],
  ["cert_mismatch", "The certificate is not byte-identical to the issued one"],
  ["wrong_allowance", "The payment names a different allowance"],
  ["bad_payer_signature", "The payment signature does not verify under the device key"],
  ["bad_amount", "Amount is 0, cumulative below amount, or seq below 1"],
  ["over_tx_limit", "Amount is above the allowance's per-payment limit"],
  ["over_cap", "Cumulative is above `funded + credit`"],
  ["too_many_payments", "Sequence number is above `maxPayments`"],
  ["expired", "Device time is more than 300 seconds after expiry"],
  ["unknown_merchant", "Hosted ledger only: the merchant id is not registered"],
  ["forbidden", "Your partner is neither the allowance's partner nor the merchant's"],
];

const APP_ROWS: string[][] = [
  ["GET", "/api/app/me", "Everything the wallet app renders: balances, limits, allowances, loans, activity, network snapshot"],
  ["POST", "/api/app/onboard", "Create the user profile (name, country, locale)"],
  ["POST", "/api/app/profile", "Update display name or locale"],
  ["POST", "/api/app/kyc", "Submit an ID for verification (sandbox check), which raises the KYC tier"],
  ["POST", "/api/app/devices", "Register a device public key"],
  ["POST", "/api/app/vault", "Lock funded value and optional overdraft into an offline vault; returns the certificate"],
  ["POST", "/api/app/vault/close", "Submit a close statement for early cash-out"],
  ["POST", "/api/app/sync", "Upload bundles held on the device; returns results and a fresh network snapshot"],
  ["POST", "/api/app/topup", "Sandbox top-up of the wallet"],
  ["POST", "/api/app/transfer", "Send wallet money to another user by email"],
  ["POST", "/api/app/repay", "Repay open overdraft loans from the wallet"],
  ["POST", "/api/app/merchant", "Enable merchant mode and get a merchant id"],
  ["POST", "/api/app/sweep", "Move merchant earnings to the wallet"],
];

export default async function ApiPage({ params }: PageProps<"/[locale]/docs/api">) {
  const { locale, t } = await docsPage(params);
  const c = t.api;
  const s = t.shell;
  const cp = { copyLabel: s.copy, copiedLabel: s.copied };
  return (
    <article>
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      {locale === "fr" && <EnglishOnly text={s.englishOnly} />}

      <H2 id="conventions">Conventions</H2>
      <Ul>
        <li>
          Base URL: the origin that serves PayVault, written <C>$PAYVAULT_URL</C> here. Paths start with{" "}
          <C>/api/v1</C>.
        </li>
        <li>Requests and responses are JSON. Responses are sent with <C>cache-control: no-store</C>.</li>
        <li>Amounts are integers in the currency&apos;s minor units. Timestamps in responses are ISO 8601, except <C>serverTime</C> (Unix seconds).</li>
        <li>Ids of allowances and payments are lowercase hex. Certificates, bundles and close statements are base64url without padding.</li>
        <li>Uploading payments is idempotent per payment id. Issuing an allowance is not deduplicated.</li>
      </Ul>

      <H2 id="auth">Authentication</H2>
      <P>
        Send your API key as a Bearer token. Keys look like <C>pv_&lt;12 hex&gt;_&lt;secret&gt;</C>. The 12 hex
        characters select the key, the secret is compared against a stored SHA-256 hash in constant time, and revoked
        keys stop working immediately. Create and revoke keys in the partner console.
      </P>
      <Code label="Authorization header" code={AUTH} {...cp} />
      <Callout tone="warn" title="Keep keys on the server">
        An API key can issue allowances and read your payments. Never ship it in a mobile or web app. Devices talk to your
        backend, and your backend talks to PayVault.
      </Callout>

      <H2 id="errors">Errors</H2>
      <P>
        Errors use one shape: <C>{"{ \"error\": { \"code\", \"message\" } }"}</C>. Branch on <C>code</C>; messages are for
        humans and may change.
      </P>
      <Code label="Error response" code={ERR} {...cp} />
      <DataTable head={["Code", "HTTP", "Meaning"]} rows={ERROR_ROWS} caption="Error codes" mono={[0, 1]} />
      <Callout tone="note" title="Known rough edge">
        Some invalid inputs that pass schema validation, such as a <C>country</C> that is not a supported pack or an
        allowance with zero spending power, currently return <C>internal</C> (500) rather than a specific 4xx code. Check
        the country list on the countries page and send <C>funded + credit</C> above zero.
      </Callout>

      <H2 id="endpoints">Endpoints</H2>

      <Endpoint
        id="get-network"
        method="GET"
        path="/api/network"
        summary="Issuer public keys and recent revocations. Public and unauthenticated so any device can cache it. Includes the keys of all partners, so a merchant can verify another partner's allowances offline."
        auth="none"
      >
        <P>
          Query: <C>since</C> (optional, Unix seconds) returns revocations created after that time. The default is the last
          30 days, and a response carries at most 5,000 revocations. <C>status</C> is <C>active</C> or <C>retired</C>;
          retired keys stay listed so older certificates still verify.
        </P>
        <Code label="Request and response" code={NETWORK} {...cp} />
      </Endpoint>

      <Endpoint
        id="post-allowances"
        method="POST"
        path="/api/v1/allowances"
        summary="Sign an allowance for a device whose funds (and credit) you hold in your own ledger. External-ledger partners only."
      >
        <Code label="Request" code={ISSUE_REQ} {...cp} />
        <Code label="Response" code={ISSUE_RES} {...cp} />
        <P>
          Errors: <C>unauthorized</C>, <C>invalid_request</C>, <C>hosted_partner</C>, <C>over_limit</C>. Emits{" "}
          <C>allowance.issued</C>.
        </P>
      </Endpoint>

      <Endpoint
        id="get-allowance"
        method="GET"
        path="/api/v1/allowances/{id}"
        summary="Current state of one of your allowances, including how much has settled and any fraud cases."
      >
        <Code label="Response" code={GET_RES} {...cp} />
        <P>
          <C>id</C> is 32 hex characters. Errors: <C>invalid_request</C> for a malformed id, <C>not_found</C> if it is not
          yours.
        </P>
      </Endpoint>

      <Endpoint
        id="revoke"
        method="POST"
        path="/api/v1/allowances/{id}/revoke"
        summary="Revoke an allowance, for example after a device is reported lost. It joins the revocation list that merchants cache. Revoking twice is harmless."
      >
        <Code label="Request and response" code={REVOKE} {...cp} />
        <P>
          Merchants only learn of a revocation when they next sync, so revocation shrinks the risk window but does not
          close it. Emits <C>allowance.revoked</C>.
        </P>
      </Endpoint>

      <Endpoint
        id="close"
        method="POST"
        path="/api/v1/allowances/close"
        summary="Submit a device-signed close statement for early cash-out. The allowance moves to closing, then to closed when every declared payment has arrived."
      >
        <Code label="Request and response" code={CLOSE} {...cp} />
        <P>
          Errors: <C>decode</C>, <C>not_found</C>, <C>forbidden</C>, <C>bad_signature</C>. Submitting a statement for an
          allowance that is no longer active returns its current state. In external-ledger mode PayVault does not move
          money: release the unspent funded value in your own ledger, using <C>declared.cumulative</C>, and treat{" "}
          <C>allowance.closed</C> as the signal that nothing more is expected.
        </P>
      </Endpoint>

      <Endpoint
        id="sync"
        method="POST"
        path="/api/v1/payments/sync"
        summary="Upload offline payment bundles collected by your devices, merchants or couriers. Each bundle is processed in its own transaction and the call never fails as a whole because one bundle is bad."
      >
        <Code label="Request" code={SYNC_REQ} {...cp} />
        <Code label="Response" code={SYNC_RES} {...cp} />
        <H3>Result status</H3>
        <Ul>
          <li>
            <C>settled</C>: honoured and allocated across funded value, overdraft and the risk pool.
          </li>
          <li>
            <C>flagged</C>: honoured, but implicated in a fork, chain break, overspend or after-close payment.
          </li>
          <li>
            <C>duplicate</C>: already known. <C>code</C> holds the stored status.
          </li>
          <li>
            <C>rejected</C>: not honoured. <C>code</C> is one of the codes below.
          </li>
        </Ul>
        <DataTable head={["Reject code", "Meaning"]} rows={REJECT_ROWS} caption="Payment reject codes" mono={[0]} />
        <P>
          <C>merchantUserId</C> and <C>payerUserId</C> are set only for users of a hosted ledger and are <C>null</C> in
          external-ledger mode. Emits <C>payment.settled</C> or <C>payment.flagged</C>, and{" "}
          <C>fraud.detected</C> when a case is serious.
        </P>
      </Endpoint>

      <Endpoint
        id="list-payments"
        method="GET"
        path="/api/v1/payments"
        summary="Your settled payments, newest first: those on your allowances plus those received by your merchants."
      >
        <P>
          Query: <C>limit</C> (1 to 200, default 50) and <C>before</C> (ISO timestamp, from{" "}
          <C>nextBefore</C>).
        </P>
        <Code label="Request and response" code={PAYMENTS} {...cp} />
      </Endpoint>

      <Endpoint
        id="list-events"
        method="GET"
        path="/api/v1/events"
        summary="Pull the same events that webhooks deliver, oldest first, with a cursor."
      >
        <P>
          Query: <C>after</C> (an event id, default 0) and <C>limit</C> (1 to 500, default 100). Store{" "}
          <C>nextAfter</C> and pass it next time. Event types and payloads are on the webhooks page.
        </P>
        <Code label="Request and response" code={EVENTS} {...cp} />
      </Endpoint>

      <Endpoint
        id="get-network-v1"
        method="GET"
        path="/api/v1/network"
        summary="The same snapshot as /api/network, behind your API key. Use whichever is convenient; devices should prefer the public one."
      >
        <P>
          Query: <C>since</C> (Unix seconds). Same response as above.
        </P>
      </Endpoint>

      <H2 id="reference-app">Reference app API</H2>
      <P>
        The reference wallet and merchant app in this repository uses a separate first-party API under{" "}
        <C>/api/app</C>. It authenticates with the user&apos;s session cookie, not an API key, is meant for the reference
        app only, and can change without notice. It is listed so you can see how the hosted-ledger sandbox works. Do not
        build partner integrations on it.
      </P>
      <DataTable head={["Method", "Path", "Purpose"]} rows={APP_ROWS} caption="Reference app API" mono={[0, 1]} />
    </article>
  );
}
