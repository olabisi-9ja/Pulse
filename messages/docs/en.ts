/** English copy for the developer docs. `fr.ts` is typed against this shape. */

export type Callout = { tone: "note" | "warn" | "danger"; title: string; body: string };
export type Table = { head: string[]; rows: string[][] };
export type Block = {
  id: string;
  title: string;
  paras?: string[];
  bullets?: string[];
  table?: Table;
  callout?: Callout;
};

export const PAGE_KEYS = [
  "intro",
  "concepts",
  "quickstart",
  "protocol",
  "api",
  "webhooks",
  "sdk",
  "overdraft",
  "countries",
  "security",
] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

/** URL segment under /{locale}/docs for each page ("" is the index). */
export const PAGE_SLUGS: Record<PageKey, string> = {
  intro: "",
  concepts: "concepts",
  quickstart: "quickstart",
  protocol: "protocol",
  api: "api",
  webhooks: "webhooks",
  sdk: "sdk",
  overdraft: "overdraft",
  countries: "countries",
  security: "security",
};

export const NAV_GROUPS: { key: "start" | "reference" | "guides"; pages: PageKey[] }[] = [
  { key: "start", pages: ["intro", "concepts", "quickstart"] },
  { key: "reference", pages: ["protocol", "api", "webhooks", "sdk"] },
  { key: "guides", pages: ["overdraft", "countries", "security"] },
];

export const en = {
  shell: {
    docs: "Docs",
    skip: "Skip to content",
    menu: "Open navigation",
    closeMenu: "Close navigation",
    navLabel: "Documentation",
    switchTo: "Français",
    switchLabel: "Read the docs in French",
    prev: "Previous",
    next: "Next",
    copy: "Copy",
    copied: "Copied",
    englishOnly: "",
    groups: { start: "Get started", reference: "Reference", guides: "Guides" },
  },
  pages: {
    intro: {
      title: "Introduction",
      description: "What PayVault is, the two layers it provides, who it is for, and how to try it in the sandbox.",
    },
    concepts: {
      title: "Concepts",
      description: "The vocabulary of offline payments: allowances, funded and overdraft value, chains, close statements and the risk pool.",
    },
    quickstart: {
      title: "Quickstart",
      description: "Issue an allowance, verify a payment offline and reconcile it, in seven steps with an external ledger.",
    },
    protocol: {
      title: "Protocol",
      description: "The wire format: byte offsets for every message, QR framing, offline verification rules and reconciliation rules.",
    },
    api: {
      title: "API reference",
      description: "REST API v1 for partners: authentication, errors and every endpoint with request and response examples.",
    },
    webhooks: {
      title: "Webhooks and events",
      description: "Event types and payloads, how to verify the HMAC signature, retry behaviour and the pull alternative.",
    },
    sdk: {
      title: "SDK",
      description: "Using @payvault/protocol in a web, React Native or Node app: requests, payments, verification and close statements.",
    },
    overdraft: {
      title: "Offline overdraft",
      description: "Offline pay-later: how limits, fees and repayment work, and why the partner is the lender of record.",
    },
    countries: {
      title: "Country packs",
      description: "The per-country configuration that sets currency, offline limits, KYC tiers, rails and data-protection context.",
    },
    security: {
      title: "Security",
      description: "The threat model, how keys are stored, and what PayVault does not claim.",
    },
  },

  intro: {
    eyebrow: "Developer documentation",
    title: "Payments that keep working when the network does not",
    lead: "PayVault is payment infrastructure for unreliable networks. Your app can accept and make payments with no signal, with the risk set in advance, and everything is reconciled and settled when connectivity returns.",
    blocks: [
      {
        id: "what",
        title: "What PayVault is",
        paras: [
          "PayVault is a B2B technology layer for banks, mobile money operators, fintechs, payment service providers and aid agencies in Africa. You keep your customers, your brand and your ledger. PayVault provides the offline protocol, the client library, the server-side reconciliation and the events that tell your systems what to settle.",
          "In production the licensed partner is the custodian of funds and the lender of record for any overdraft. The reference app in this repository also includes a hosted sandbox ledger, so you can try the full flow without a ledger of your own.",
        ],
      },
      {
        id: "layers",
        title: "Two layers",
        paras: [
          "Layer 1 is reliability. Every payment is a signed, hash-chained message that is stored durably on the device, moved by QR code, uploaded whenever someone has signal, and de-duplicated by the server. A payment can be retried, relayed by a courier or uploaded twice without being counted twice.",
          "Layer 2 is guaranteed offline acceptance. A merchant can decide to accept a payment with no network because the value behind it was locked in advance (the offline vault) and, optionally, because the partner extended a limited overdraft. The merchant verifies the payment fully on the device. If it passes, the merchant is paid, whatever happens later.",
        ],
        callout: {
          tone: "warn",
          title: "Bounded, not impossible",
          body: "A phone with no network cannot know what it spent elsewhere, so double-spending offline cannot be made impossible. PayVault bounds it and detects it. The loss is limited to the allowance cap that the partner chose, a second spend is provable from two signed payments with the same sequence number, the merchant is still paid, and the loss is recovered from the identified account holder.",
        },
      },
      {
        id: "who",
        title: "Who it is for",
        bullets: [
          "Mobile money operators and agent networks that lose sales to network downtime.",
          "Banks, fintechs and payment service providers that want offline acceptance in their existing apps and POS flows.",
          "Humanitarian and government cash programmes that pay in low-connectivity areas.",
          "Transit, ticketing and market use cases with many small, frequent payments.",
        ],
      },
      {
        id: "flow",
        title: "The flow in five steps",
        bullets: [
          "Issue: your backend asks PayVault to sign an allowance for a customer's device key, after you have locked the funds in your ledger.",
          "Request: the merchant's device shows a payment request as a QR code.",
          "Pay: the customer's device signs a payment, chained to its previous one, and shows it back as a QR code.",
          "Verify: the merchant's device checks signatures, limits, revocations and the chain, offline, and accepts or rejects.",
          "Reconcile: when either side has signal, payments are uploaded. PayVault de-duplicates them, allocates each one to funded value, overdraft or the risk pool, detects forks, and emits events for your ledger.",
        ],
      },
      {
        id: "sandbox",
        title: "The sandbox",
        paras: [
          "PayVault is currently a prototype. The API and the console you can reach run in sandbox mode: no real money moves, no funds are held, and the same API key format is used throughout. Every country pack is marked concept, and the limits in it are illustrative placeholders, not regulator-approved values.",
          "To try it, create a partner account in the console, create an API key, and follow the quickstart. Requests in these docs use $PAYVAULT_URL for the origin that serves the API.",
        ],
      },
    ] as Block[],
    nextTitle: "Where to go next",
    next: [
      { slug: "concepts", title: "Concepts", body: "The vocabulary, in one page." },
      { slug: "quickstart", title: "Quickstart", body: "Issue, pay, verify and sync in seven steps." },
      { slug: "protocol", title: "Protocol", body: "Byte-level wire format and rules." },
      { slug: "api", title: "API reference", body: "Every partner endpoint." },
    ],
  },

  concepts: {
    eyebrow: "Concepts",
    title: "The vocabulary of offline payments",
    lead: "Ten ideas explain almost everything in PayVault. Amounts are always integers in the currency's minor units (for example kobo or centimes), and timestamps are Unix seconds on the wire.",
    blocks: [
      {
        id: "allowance",
        title: "Allowance (the offline vault)",
        paras: [
          "An allowance is a certificate, signed by the partner's issuer key, that says: this device key may spend up to this much, in this currency, until this time. It is bound to the device's public key, so only that device can sign payments against it.",
          "It carries a per-payment limit, a maximum number of payments, an issue time, an expiry and the id of the issuer key that signed it. Its 82-byte body is exactly what the issuer signs (see the protocol page).",
          "The word vault refers to the money behind it. Before the certificate is issued, the partner locks the funded value in its ledger. The device never holds money, only a signed right to spend value that is already set aside.",
        ],
      },
      {
        id: "funded-vs-overdraft",
        title: "Funded and overdraft value",
        paras: [
          "The spending cap of an allowance is funded plus credit. Funded value is the holder's own money, locked in advance. Credit is an optional overdraft line that the partner extends for offline pay-later.",
          "Spending draws the funded part first. Anything above it is a credit drawdown, which becomes a loan after settlement and is repaid according to the partner's terms. The merchant is paid in full either way.",
        ],
        table: {
          head: ["", "Funded", "Overdraft (credit)"],
          rows: [
            ["Whose money", "The holder's, locked before issue", "The partner's, lent"],
            ["Drawn", "First", "Only above the funded amount"],
            ["Unspent at expiry", "Returned to the holder", "Simply lapses"],
            ["After settlement", "Nothing owed", "A loan with a fee, due within the term"],
          ],
        },
      },
      {
        id: "request",
        title: "Payment request",
        paras: [
          "The merchant creates a request with its merchant id, the currency, the amount, a random 8-byte nonce, the time and a display name of up to 32 bytes, and shows it as a QR code.",
          "The nonce binds the payment to this request. A payment signed for one request cannot be replayed against another, and the merchant can refuse a nonce it has already used.",
        ],
      },
      {
        id: "bundle",
        title: "Payment bundle",
        paras: [
          "The payer's device answers with a bundle: the allowance certificate plus the signed payment, 276 bytes in total, shown as a QR code. Because the bundle contains the certificate, the merchant needs nothing else to verify it, only the issuer's public key it cached earlier.",
          "A bundle is self-authenticating. Anyone can carry it, and no one along the way can alter it without breaking a signature.",
        ],
      },
      {
        id: "chain",
        title: "Sequence and hash chain",
        paras: [
          "Payments from one allowance are numbered 1, 2, 3 and so on, and each records the running total spent (cumulative) and the hash of the payment before it. Payment 1 points at a genesis hash computed from the certificate itself.",
          "The payment id is the first 16 bytes of the SHA-256 of the signed body. Because each payment commits to its predecessor, the history cannot be reordered or edited, and two different payments with the same sequence number are direct evidence of a fork, meaning a double-spend attempt.",
        ],
        callout: {
          tone: "warn",
          title: "Persist before you show",
          body: "A device must save its new state (sequence, cumulative, last hash) before it releases the payment. If it crashes in between and reuses a sequence number, the honest user looks like a cheater.",
        },
      },
      {
        id: "close",
        title: "Close statement and early cash-out",
        paras: [
          "A holder who no longer wants to spend can have the device sign a close statement: the allowance id, the last sequence number and the cumulative total at which it stopped.",
          "On receipt, PayVault immediately returns the funded value above the declared total. The rest waits until every declared payment has arrived, and then the allowance is closed. A payment beyond the declared sequence is treated as fraud.",
        ],
      },
      {
        id: "expiry",
        title: "Expiry and grace",
        paras: [
          "Every allowance expires after a time set by the country pack, for example 72 hours. Merchants and the server tolerate 5 minutes of clock skew, because phone clocks are not trusted.",
          "Unspent funded value returns to the holder after expiry plus a 24-hour grace period, which gives late payments time to arrive. A payment that arrives after the refund is still honoured: it is taken from the holder's wallet where the ledger is hosted, and otherwise from the risk pool.",
        ],
      },
      {
        id: "revocation",
        title: "Issuer keys and revocation lists",
        paras: [
          "Merchants verify certificates against issuer public keys and check certificate ids against a revocation list. Both come from the network snapshot, GET /api/network, which devices cache whenever they have signal.",
          "Revocation is effective only once a merchant has synced. It shrinks the window for a known-bad allowance but cannot close it, which is why the cap matters. Revocations are kept for 30 days in the feed.",
        ],
      },
      {
        id: "courier",
        title: "Courier sync",
        paras: [
          "Payments do not have to be uploaded by the merchant. The payer, the merchant, a courier or an agent with a phone that has signal can upload any bundle, and the server records how it arrived (merchant, payer, courier or api).",
          "Uploading is idempotent per payment id, and one request carries up to 500 bundles. Uploading the same bundle twice is safe.",
        ],
      },
      {
        id: "guarantee",
        title: "Guarantee and risk pool",
        paras: [
          "Every payment that passed the checks a merchant could perform offline is honoured to the merchant. When the server settles a payment it allocates the amount in a fixed order: funded value, then overdraft, then recovery from the holder's wallet, and only then the risk pool.",
          "The risk pool absorbs what the holder's own value and credit could not cover, which happens only if the holder double-spent. The loss is bounded by the allowance cap, and the account is frozen and the allowance revoked. How the pool is funded and sized is a commercial decision between PayVault and the partner.",
        ],
        callout: {
          tone: "note",
          title: "What is guaranteed",
          body: "The guarantee covers a payment that verifies offline against a current issuer key and a revocation list that is not stale. It does not cover a payment the merchant accepted without verifying it, or a certificate revoked before the merchant last synced and accepted anyway.",
        },
      },
    ] as Block[],
  },

  quickstart: {
    eyebrow: "Quickstart",
    title: "From API key to reconciled payment",
    lead: "This walkthrough is for a partner that keeps balances in its own ledger (external-ledger mode). You lock funds yourself, PayVault signs the allowance, devices pay offline, and you settle from events.",
  },
  protocol: {
    eyebrow: "Reference",
    title: "Wire protocol",
    lead: "All integers are big-endian. Amounts are unsigned integers in minor units. Times are Unix seconds. Version byte is 1.",
  },
  api: {
    eyebrow: "Reference",
    title: "API reference, v1",
    lead: "The partner API is JSON over HTTPS. Binary values are hex (ids, public keys) or base64url without padding (certificates, bundles, statements).",
  },
  webhooks: {
    eyebrow: "Reference",
    title: "Webhooks and events",
    lead: "PayVault writes an event in the same database transaction as the change it describes. You receive it by webhook, or you can pull it.",
  },
  sdk: {
    eyebrow: "Reference",
    title: "SDK: @payvault/protocol",
    lead: "The protocol package is TypeScript with no runtime dependencies beyond WebCrypto. It runs in browsers, React Native (with a WebCrypto implementation) and Node 20+.",
  },
  overdraft: {
    eyebrow: "Guide",
    title: "Offline overdraft",
    lead: "An optional credit line inside the allowance, so a customer can pay offline even when their funded balance is small. The partner is the lender of record.",
  },
  countries: {
    eyebrow: "Guide",
    title: "Country packs",
    lead: "A country pack is data, not code: it sets the currency, the offline limits, the KYC ladder, the local rails and the data-protection context for one market.",
  },
  security: {
    eyebrow: "Guide",
    title: "Security",
    lead: "What we defend against, how keys are held today, and the claims we deliberately do not make.",
  },
};

export type DocsMessages = typeof en;
export default en;
