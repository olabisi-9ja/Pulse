import { Code } from "@/components/docs/Code";
import { C, Callout, DataTable, EnglishOnly, H2, H3, P, PageHeader, Ul } from "@/components/docs/ui";
import { docsMetadata, docsPage } from "../_lib";

export async function generateMetadata({ params }: PageProps<"/[locale]/docs/sdk">) {
  return docsMetadata(params, "sdk");
}

const KEYS = `import { generateKeyPair, exportPublicKey, toHex } from "@payvault/protocol";

// Non-extractable ECDSA P-256 key. IndexedDB can store the CryptoKeyPair
// object itself, so the raw private key never enters JavaScript memory.
const keys = await generateKeyPair();               // extractable = false
await kv.set("device-keys", keys);
const publicKeyHex = toHex(await exportPublicKey(keys.publicKey));`;

const PAYER = `import {
  bundleToQr, canSpend, parseQr, signPayment, walletBalance,
  type WalletState,
} from "@payvault/protocol";

let queue: Promise<unknown> = Promise.resolve();

/** Serialise payments: two concurrent signs from the same state would fork. */
export function pay(scannedText: string): Promise<string> {
  const run = queue.then(async () => {
    const scanned = parseQr(scannedText);
    if (scanned.kind !== "request") throw new Error("Not a payment request");

    const state = (await kv.get("wallet-state")) as WalletState;
    const check = canSpend(state, scanned.request.amount, scanned.request.currency);
    if (!check.ok) throw new Error(check.message);       // check.code: expired, over_cap, ...

    const keys = (await kv.get("device-keys")) as CryptoKeyPair;
    const { payment, state: next } = await signPayment(keys.privateKey, state, scanned.request);

    await kv.set("wallet-state", next);                  // 1. persist the new state
    return bundleToQr({ cert: next.cert, payment });     // 2. only then show it
  });
  queue = run.catch(() => undefined);
  return run;
}

console.log(walletBalance(state)); // { cap, spent, remaining, fundedRemaining, creditRemaining, creditUsed, paymentsLeft }`;

const MERCHANT = `import {
  createRequest, decodePayment, encodeBundle, fromHex, importPublicKey,
  parseQr, requestToQr, toBase64Url, verifyBundle,
} from "@payvault/protocol";

// 1. Refresh the cache whenever there is signal.
export async function refreshNetwork() {
  const net = await (await fetch("/api/network")).json();
  await kv.set("network", { ...net, fetchedAt: Date.now() });
}

// 2. Build the verifier context from the cache and your own records.
async function contextFor(request: PaymentRequest) {
  const net = await kv.get("network");
  const keyCache = new Map<number, CryptoKey>();
  return {
    issuerKey: async (kid: number) => {
      if (!keyCache.has(kid)) {
        const k = net.issuerKeys.find((x) => x.kid === kid);
        if (!k) return undefined;
        keyCache.set(kid, await importPublicKey(fromHex(k.publicKey)));
      }
      return keyCache.get(kid);
    },
    isRevoked: (id: string) => net.revocations.some((r) => r.allowanceId === id),
    merchantId,
    request,
    isNonceUsed: (hex: string) => usedNonces.has(hex),
    // seen: payments you already hold from the same allowance (from your outbox)
  };
}

export async function charge(amountMinor: number) {
  const request = createRequest(merchantId, amountMinor, "NGN", "Mama Ade Stores");
  return { request, qr: requestToQr(request) };
}

export async function accept(scannedText: string, request: PaymentRequest) {
  const scanned = parseQr(scannedText);
  if (scanned.kind !== "bundle") throw new Error("Not a payment bundle");
  const result = await verifyBundle(scanned.bundle, await contextFor(request));
  if (!result.ok) return { accepted: false as const, code: result.code };
  usedNonces.add(toHex(request.nonce));
  await outbox.put(result.id, toBase64Url(encodeBundle(scanned.bundle))); // persist first
  return { accepted: true as const, creditDrawn: result.creditDrawn };
}`;

const SEEN = `// Give verifyBundle the payments you already hold from the same allowance,
// so it can catch duplicates, forks and impossible totals on the spot.
const seen = (await outbox.byAllowance(allowanceHex)).map((b) => ({
  id: b.id,
  payment: decodeBundle(fromBase64Url(b.bundle)).payment,
}));
await verifyBundle(bundle, { ...ctx, seen });`;

const CLOSE = `import { encodeClose, signClose, toBase64Url } from "@payvault/protocol";

const state = (await kv.get("wallet-state")) as WalletState;
const statement = await signClose(keys.privateKey, state);
// The device should stop spending this allowance from now on.
await markClosed(allowanceHex);           // your own flag in app storage

// Send this to your backend, which posts it to POST /api/v1/allowances/close
const close = toBase64Url(encodeClose(statement));`;

const ERR = `import { ProtocolError } from "@payvault/protocol";

try {
  parseQr(text);
} catch (e) {
  if (e instanceof ProtocolError) {
    // e.code: not_payvault | bad_base45 | bad_version | bad_type | truncated | trailing_bytes ...
  }
}`;

const API_ROWS: string[][] = [
  ["generateKeyPair, exportPublicKey, importPublicKey", "Device and issuer keys. Public keys are 33-byte compressed P-256"],
  ["createRequest, requestToQr", "Merchant: build and display a payment request"],
  ["parseQr, fromQrText, toQrText", "Decode or frame any PayVault QR text"],
  ["initWalletState, walletBalance, canSpend, splitDraw", "Payer: state and pre-checks"],
  ["signPayment", "Payer: sign the next payment and return the new state"],
  ["bundleToQr, encodeBundle, decodeBundle", "The 276-byte bundle"],
  ["verifyBundle", "Merchant: offline verification, returns `{ ok, id, payment, cert, creditDrawn }` or `{ ok: false, code }`"],
  ["signClose, encodeClose, decodeClose, verifyCloseSignature", "Early cash-out statements"],
  ["encodeAllowance, decodeAllowance", "Certificates"],
  ["paymentId, allowanceGenesis", "Ids and the chain anchor"],
  ["toHex, fromHex, toBase64Url, fromBase64Url, randomBytes", "Byte helpers"],
  ["analyzeAllowance", "Server side: fork, chain-break and overspend analysis"],
];

export default async function SdkPage({ params }: PageProps<"/[locale]/docs/sdk">) {
  const { locale, t } = await docsPage(params);
  const c = t.sdk;
  const s = t.shell;
  const cp = { copyLabel: s.copy, copiedLabel: s.copied };
  return (
    <article>
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      {locale === "fr" && <EnglishOnly text={s.englishOnly} />}

      <H2 id="install">Install and platforms</H2>
      <P>
        <C>@payvault/protocol</C> is currently a private workspace package in this repository and ships as TypeScript
        source. A published build is planned. It has no runtime dependencies and needs only WebCrypto with ECDSA P-256 and
        SHA-256.
      </P>
      <DataTable
        head={["Platform", "Status", "Notes"]}
        caption="Platform support"
        rows={[
          ["Web (browser, PWA)", "Available", "WebCrypto needs HTTPS or localhost. Keys are non-extractable"],
          ["Node 20+", "Available", "Global `crypto.subtle`. Use for servers, tests and tools"],
          ["React Native", "Available with a WebCrypto implementation", "Provide `globalThis.crypto.subtle` with P-256 support, and store keys in the platform keystore"],
          ["Android (Kotlin)", "Planned", "StrongBox or TEE-backed keys"],
          ["iOS (Swift)", "Planned", "Secure Enclave keys"],
          ["USSD and SMS fallback", "Planned", "For feature phones. Not built"],
        ]}
      />

      <H2 id="surface">What is exported</H2>
      <DataTable head={["Exports", "Purpose"]} rows={API_ROWS} caption="Exports of @payvault/protocol" mono={[0]} />

      <H2 id="keys">Device keys</H2>
      <P>
        Generate a key pair per device and enrol its public key with your backend. Never export the private key.
      </P>
      <Code label="TypeScript" code={KEYS} {...cp} />

      <H2 id="payer">Payer: sign, persist, then show</H2>
      <P>
        <C>signPayment</C> is a pure function of the state, the request and the key. It returns a payment and the next
        state. Two rules keep an honest device from looking like a cheater:
      </P>
      <Ul>
        <li>
          Persist the new state <strong>before</strong> you show the QR. If the app is killed in between, the worst case is
          a payment that was signed but never shown.
        </li>
        <li>
          Run payments one at a time. Two overlapping calls that start from the same state would sign two different
          payments with the same sequence number, which is exactly a fork.
        </li>
      </Ul>
      <Code label="TypeScript" code={PAYER} {...cp} />
      <Callout tone="note" title="Sequence gaps">
        If a state is saved but its QR is never scanned, the chain contains a payment nobody holds. That is not treated
        as fraud, but it still counts: its amount stays in every later cumulative total, and an early cash-out cannot
        complete until that payment arrives or the allowance expires. Never roll a state back to hide a gap.
      </Callout>

      <H2 id="merchant">Merchant: request, verify, store</H2>
      <P>
        Cache the network snapshot whenever there is signal. <C>verifyBundle</C> accepts the issuer key lookup as a
        function, so it can be a map, a database or an in-memory cache, and it can be asynchronous. Treat a stale cache
        as a business decision: the older the revocation list, the larger the window in which a bad allowance can be
        accepted.
      </P>
      <Code label="TypeScript" code={MERCHANT} {...cp} />
      <H3>Passing payments you already hold</H3>
      <Code label="TypeScript" code={SEEN} {...cp} />

      <H2 id="close">Close statement</H2>
      <P>
        To let a customer cash out early, sign a close statement at the current state, stop spending, and hand the
        statement to your backend.
      </P>
      <Code label="TypeScript" code={CLOSE} {...cp} />

      <H2 id="errors">Errors</H2>
      <P>
        Decoders and <C>signPayment</C> throw <C>ProtocolError</C> with a stable <C>code</C>. <C>verifyBundle</C> does not
        throw for a bad payment; it returns <C>{"{ ok: false, code }"}</C>. Reject codes are listed on the protocol page.
      </P>
      <Code label="TypeScript" code={ERR} {...cp} />
    </article>
  );
}
