import { Code } from "@/components/docs/Code";
import { C, Callout, DataTable, EnglishOnly, H2, H3, Ol, P, PageHeader, Ul } from "@/components/docs/ui";
import { docsMetadata, docsPage } from "../_lib";

export async function generateMetadata({ params }: PageProps<"/[locale]/docs/protocol">) {
  return docsMetadata(params, "protocol");
}

const FIELD_HEAD = ["Offset", "Size", "Field", "Type", "Notes"];

const ALLOWANCE: string[][] = [
  ["0", "1", "version", "u8", "Always 1"],
  ["1", "1", "type", "u8", "0x01"],
  ["2", "16", "allowanceId", "bytes", "Random, unique per allowance"],
  ["18", "4", "issuerKid", "u32", "Id of the issuer key that signed this"],
  ["22", "33", "devicePub", "bytes", "Compressed P-256 point (02 or 03 prefix)"],
  ["55", "2", "country", "ASCII", "ISO 3166-1 alpha-2, e.g. NG"],
  ["57", "3", "currency", "ASCII", "ISO 4217, e.g. NGN"],
  ["60", "4", "funded", "u32", "Minor units"],
  ["64", "4", "credit", "u32", "Minor units of overdraft"],
  ["68", "4", "perTxLimit", "u32", "Largest single payment"],
  ["72", "2", "maxPayments", "u16", "Payment count limit"],
  ["74", "4", "issuedAt", "u32", "Unix seconds"],
  ["78", "4", "expiresAt", "u32", "Unix seconds"],
  ["82", "64", "signature", "bytes", "Issuer ECDSA over bytes 0..81, raw r||s"],
];

const PAYMENT: string[][] = [
  ["0", "1", "version", "u8", "Always 1"],
  ["1", "1", "type", "u8", "0x02"],
  ["2", "16", "allowanceId", "bytes", "The allowance being spent"],
  ["18", "2", "seq", "u16", "Starts at 1, increments by 1"],
  ["20", "4", "amount", "u32", "This payment, minor units"],
  ["24", "4", "cumulative", "u32", "Total spent including this payment"],
  ["28", "8", "merchantId", "bytes", "From the request"],
  ["36", "8", "nonce", "bytes", "From the request"],
  ["44", "4", "time", "u32", "Device clock, Unix seconds"],
  ["48", "16", "prevHash", "bytes", "Id of payment seq-1, or the genesis hash for seq 1"],
  ["64", "64", "signature", "bytes", "Device ECDSA over bytes 0..63, raw r||s"],
];

const REQUEST: string[][] = [
  ["0", "1", "version", "u8", "Always 1"],
  ["1", "1", "type", "u8", "0x03"],
  ["2", "8", "merchantId", "bytes", "Assigned by the partner"],
  ["10", "3", "currency", "ASCII", "ISO 4217"],
  ["13", "4", "amount", "u32", "Minor units"],
  ["17", "8", "nonce", "bytes", "Random per request"],
  ["25", "4", "time", "u32", "Unix seconds"],
  ["29", "1", "nameLen", "u8", "0 to 32"],
  ["30", "nameLen", "name", "UTF-8", "Display name. Longer names are truncated by the encoder"],
];

const BUNDLE: string[][] = [
  ["0", "1", "version", "u8", "Always 1"],
  ["1", "1", "type", "u8", "0x04"],
  ["2", "146", "allowance", "body + sig", "Allowance body (82) followed by its signature (64)"],
  ["148", "128", "payment", "body + sig", "Payment body (64) followed by its signature (64)"],
];

const CLOSE: string[][] = [
  ["0", "1", "version", "u8", "Always 1"],
  ["1", "1", "type", "u8", "0x05"],
  ["2", "16", "allowanceId", "bytes", "The allowance being closed"],
  ["18", "2", "seq", "u16", "Last sequence number spent"],
  ["20", "4", "cumulative", "u32", "Total spent at that point"],
  ["24", "4", "time", "u32", "Device clock, Unix seconds"],
  ["28", "64", "signature", "bytes", "Device ECDSA over bytes 0..27, raw r||s"],
];

const IDS = `payment id = SHA-256(paymentBody)[0..16]        // signature excluded
genesis    = SHA-256(allowanceBody)[0..16]      // prevHash of payment #1
prevHash(n) = payment id of payment n-1`;

const QR = `text  = "PV" + base45(payload)          // RFC 9285, QR alphanumeric charset
Request  <= 62 bytes  ->  at most 95 characters
Bundle    276 bytes   ->  416 characters`;

const PARSE = `import { parseQr } from "@payvault/protocol";

const scanned = parseQr(text);
// { kind: "request", request } | { kind: "bundle", bundle }
// Throws ProtocolError("not_payvault") when the text does not start with "PV".`;

export default async function ProtocolPage({ params }: PageProps<"/[locale]/docs/protocol">) {
  const { locale, t } = await docsPage(params);
  const c = t.protocol;
  const s = t.shell;
  return (
    <article>
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      {locale === "fr" && <EnglishOnly text={s.englishOnly} />}
      <P>
        This page is generated from the implementation in <C>packages/protocol</C>. A Markdown copy lives in the
        repository at <C>docs/PROTOCOL.md</C>. Every message starts with a version byte and a type byte. Decoders reject an
        unknown version, a wrong type, truncated input and trailing bytes.
      </P>

      <H2 id="crypto">Cryptography</H2>
      <Ul>
        <li>
          Signatures are ECDSA on P-256 with SHA-256, encoded as raw <C>r||s</C>, 64 bytes. P-256 is what phone secure
          hardware supports natively and what WebCrypto can keep non-extractable.
        </li>
        <li>Public keys travel compressed: 33 bytes, with a 0x02 or 0x03 prefix.</li>
        <li>A signature covers the message body only, that is the bytes before the signature, including version and type.</li>
        <li>Hashes are SHA-256 truncated to 16 bytes.</li>
      </Ul>
      <Code label="identifiers" code={IDS} copyLabel={s.copy} copiedLabel={s.copied} />
      <P>
        The payment id excludes the signature on purpose. ECDSA signatures are malleable, and this way a re-signed copy of
        the same payment cannot be turned into a second, distinct id.
      </P>

      <H2 id="allowance">Allowance certificate (82 B body + 64 B signature)</H2>
      <P>Signed by the partner&apos;s issuer key. The whole certificate is 146 bytes.</P>
      <DataTable head={FIELD_HEAD} rows={ALLOWANCE} caption="Allowance certificate layout" mono={[0, 1, 2]} />

      <H2 id="payment">Payment (64 B body + 64 B signature)</H2>
      <P>Signed by the device key named in the allowance. The whole payment is 128 bytes.</P>
      <DataTable head={FIELD_HEAD} rows={PAYMENT} caption="Payment layout" mono={[0, 1, 2]} />

      <H2 id="request">Payment request (30 to 62 B, unsigned)</H2>
      <P>
        Created by the merchant. It is not signed: it only tells the payer what to sign. The payment&apos;s signature
        and the merchant&apos;s checks bind the answer to it.
      </P>
      <DataTable head={FIELD_HEAD} rows={REQUEST} caption="Payment request layout" mono={[0, 1, 2]} />

      <H2 id="bundle">Bundle (276 B)</H2>
      <P>What the payer shows and the merchant scans. It is the two signed structures back to back.</P>
      <DataTable head={FIELD_HEAD} rows={BUNDLE} caption="Bundle layout" mono={[0, 1, 2]} />

      <H2 id="close">Close statement (28 B body + 64 B signature)</H2>
      <P>Signed by the device. The whole statement is 92 bytes.</P>
      <DataTable head={FIELD_HEAD} rows={CLOSE} caption="Close statement layout" mono={[0, 1, 2]} />

      <H2 id="qr">QR framing</H2>
      <P>
        A QR payload is the literal text <C>PV</C> followed by the Base45 encoding (RFC 9285) of the message bytes. Base45
        uses only the QR alphanumeric character set, which packs densely and survives camera decoders that mangle binary
        data. Requests and bundles are the two message types shown as QR codes.
      </P>
      <Code label="framing" code={QR} copyLabel={s.copy} copiedLabel={s.copied} />
      <Code label="parsing" code={PARSE} copyLabel={s.copy} copiedLabel={s.copied} />

      <H2 id="verification">Offline verification rules</H2>
      <P>
        <C>verifyBundle</C> runs these checks in this order and returns the first failure. It needs only the bundle, the
        cached issuer keys and revocations, the merchant&apos;s own state and the clock. The default tolerated clock skew
        is 300 seconds, because device clocks are not trusted.
      </P>
      <DataTable
        head={["#", "Code", "Fails when"]}
        caption="Offline verification rules, in order"
        mono={[0, 1]}
        rows={[
          ["1", "unknown_issuer", "No cached public key for issuerKid"],
          ["2", "bad_issuer_signature", "The certificate signature does not verify under that key"],
          ["3", "not_yet_valid", "issuedAt is more than the skew in the future"],
          ["4", "expired", "now is more than the skew past expiresAt"],
          ["5", "revoked", "The allowance id is in the cached revocation list"],
          ["6", "wrong_allowance", "The payment's allowanceId differs from the certificate's"],
          ["7", "bad_payer_signature", "The payment signature does not verify under devicePub"],
          ["8", "wrong_merchant", "The payment's merchantId is not this merchant's"],
          ["9", "request_mismatch", "Nonce, amount or currency differ from the request this merchant displayed"],
          ["10", "bad_amount", "amount is 0, cumulative is below amount, or seq is below 1"],
          ["11", "over_tx_limit", "amount is above perTxLimit"],
          ["12", "over_cap", "cumulative is above funded + credit"],
          ["13", "too_many_payments", "seq is above maxPayments"],
          ["14", "bad_chain", "For seq 1: cumulative differs from amount, or prevHash is not the genesis hash"],
          [
            "15",
            "duplicate, fork, inconsistent",
            "Against payments this merchant already holds from the same allowance (see below)",
          ],
          ["16", "nonce_reused", "The nonce was already used, per the merchant's own record"],
        ]}
      />
      <H3>Checks against payments already seen</H3>
      <Ul>
        <li>
          <C>duplicate</C>: the same payment id was already accepted.
        </li>
        <li>
          <C>fork</C>: another payment with the same <C>seq</C> exists, or the neighbouring payment is not linked by{" "}
          <C>prevHash</C>.
        </li>
        <li>
          <C>inconsistent</C>: the cumulative totals cannot both be true (a later payment must start at or above an
          earlier one&apos;s cumulative).
        </li>
      </Ul>
      <P>
        On success the result includes <C>creditDrawn</C>, the part of this payment that comes from the overdraft.
      </P>
      <Callout tone="warn" title="What a merchant cannot see">
        A merchant can only compare a payment with the ones it has itself seen. A payer can spend the same balance at two
        different merchants, and neither can tell. That is the residual risk: it is bounded by the allowance cap and
        found on sync, which is why reconciliation and the risk pool exist.
      </Callout>

      <H2 id="reconciliation">Reconciliation rules</H2>
      <P>
        The server sees every payment for an allowance, across all merchants. It runs two stages.
      </P>
      <H3>Stage 1: per-payment ingestion</H3>
      <Ol>
        <li>Decode the bundle (<C>decode</C> on failure).</li>
        <li>Find the allowance (<C>unknown_allowance</C>).</li>
        <li>The certificate must be byte-identical to the one PayVault issued (<C>cert_mismatch</C>).</li>
        <li>Payment allowance id matches (<C>wrong_allowance</C>); payer signature verifies against the stored device key (<C>bad_payer_signature</C>).</li>
        <li>If the payment id is known, return <C>duplicate</C> without changing anything.</li>
        <li>Range checks: <C>bad_amount</C>, <C>over_tx_limit</C>, <C>over_cap</C>, <C>too_many_payments</C>, and <C>expired</C> when the device time is more than 300 seconds past expiry.</li>
        <li>Hosted ledgers must know the merchant (<C>unknown_merchant</C>); API submitters may only submit for their own allowances or merchants (<C>forbidden</C>).</li>
      </Ol>
      <H3>Stage 2: allocation and analysis</H3>
      <P>An accepted payment is honoured. The amount is allocated in a fixed order:</P>
      <Ol>
        <li>Funded value not yet settled or refunded.</li>
        <li>Overdraft (credit) not yet settled. Any draw creates or increases the allowance&apos;s loan.</li>
        <li>Recovery from the holder&apos;s wallet, hosted ledgers only, when the vault was already refunded.</li>
        <li>The risk pool, for whatever remains.</li>
      </Ol>
      <P>Then all payments for the allowance are re-analysed:</P>
      <Ul>
        <li>Payments are de-duplicated by id and sorted by sequence number.</li>
        <li>
          A <strong>fork</strong> is more than one distinct payment with the same sequence number.
        </li>
        <li>
          A <strong>chain break</strong> is a payment whose <C>prevHash</C> does not equal the previous payment&apos;s id, or whose cumulative is not the previous cumulative plus its amount.
        </li>
        <li>
          An <strong>overspend</strong> is total honoured amount above <C>funded + credit</C>.
        </li>
        <li>
          <strong>After close</strong> is a payment with a sequence number above a declared close statement.
        </li>
      </Ul>
      <P>
        Implicated payments are marked <C>flagged</C> but stay honoured. Any fork, chain break, after-close payment or overspend
        with a real loss revokes the allowance (it enters the revocation list), freezes the holder&apos;s credit profile
        and emits <C>fraud.detected</C>. Fraud cases are visible on <C>GET /api/v1/allowances/{"{id}"}</C>.
      </P>
    </article>
  );
}
