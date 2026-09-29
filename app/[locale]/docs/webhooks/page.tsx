import { Code } from "@/components/docs/Code";
import { C, Callout, DataTable, EnglishOnly, H2, H3, Ol, P, PageHeader, Ul } from "@/components/docs/ui";
import { docsMetadata, docsPage } from "../_lib";

export async function generateMetadata({ params }: PageProps<"/[locale]/docs/webhooks">) {
  return docsMetadata(params, "webhooks");
}

const ENVELOPE = `POST https://your-server.example/payvault/webhook
content-type: application/json
x-payvault-timestamp: 1790012345
x-payvault-signature: 3f6a9c...   (hex HMAC-SHA256)

{"id":41,"type":"payment.settled","createdAt":"2026-09-29T10:02:11.000Z","data":{ ... }}`;

const PAYLOADS = `// allowance.issued
{ "allowanceId": "9f2c...", "userId": null, "currency": "NGN", "funded": 500000, "credit": 0,
  "expiresAt": "2026-10-02T09:30:00.000Z", "externalRef": "cust_8123_vault_1" }
// externalRef is present when issued through POST /api/v1/allowances. userId is set for hosted ledgers.

// allowance.closed
{ "allowanceId": "9f2c...", "reason": "cashout" }     // reason: "cashout" | "expired"

// allowance.revoked
{ "allowanceId": "9f2c...", "reason": "fork" }        // your reason, or the fraud case kind

// payment.settled  and  payment.flagged   (same shape)
{ "paymentId": "5d0e...c1", "allowanceId": "9f2c...", "amount": 250000, "currency": "NGN",
  "merchantId": "a1b2c3d4e5f60718", "seq": 1,
  "fromFunded": 250000, "fromCredit": 0, "fromRiskPool": 0 }

// fraud.detected
{ "allowanceId": "9f2c...", "userId": null,
  "cases": [ { "kind": "fork", "seq": 3, "paymentIds": ["5d0e...c1", "77ab...09"], "loss": 0 } ] }

// loan.drawn
{ "allowanceId": "9f2c...", "userId": "c2f1...", "currency": "NGN", "amount": 120000, "fee": 2400 }

// loan.repaid
{ "loanId": "e6a0...", "userId": "c2f1..." }`;

const VERIFY = `import { createHmac, timingSafeEqual } from "node:crypto";
import express from "express";

const app = express();
const SECRET = process.env.PAYVAULT_WEBHOOK_SECRET!;
const TOLERANCE_SECONDS = 300;

// The signature covers the exact bytes we sent, so read the raw body.
app.post("/payvault/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const timestamp = req.header("x-payvault-timestamp") ?? "";
  const signature = req.header("x-payvault-signature") ?? "";
  const body = req.body.toString("utf8");

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return res.sendStatus(400);

  const expected = createHmac("sha256", SECRET).update(\`\${timestamp}.\${body}\`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.sendStatus(401);

  const event = JSON.parse(body); // { id, type, createdAt, data }
  // Process idempotently, keyed by event.id, then acknowledge.
  handleEvent(event);
  res.sendStatus(200);
});`;

const PULL = `# Poll from the last id you stored
curl -sS "$PAYVAULT_URL/api/v1/events?after=$LAST_ID&limit=100" \\
  -H "Authorization: Bearer $PAYVAULT_KEY"

# { "data": [ { "id": 42, "type": "...", "createdAt": "...", "data": { ... } } ], "nextAfter": 42 }`;

export default async function WebhooksPage({ params }: PageProps<"/[locale]/docs/webhooks">) {
  const { locale, t } = await docsPage(params);
  const c = t.webhooks;
  const s = t.shell;
  const cp = { copyLabel: s.copy, copiedLabel: s.copied };
  return (
    <article>
      <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      {locale === "fr" && <EnglishOnly text={s.englishOnly} />}

      <H2 id="delivery">Delivery</H2>
      <P>
        Set your webhook URL and signing secret in the partner console. PayVault sends each event as an HTTP{" "}
        <C>POST</C> with a JSON body and treats any 2xx response as success. A request that takes longer than 8 seconds or
        returns anything else counts as a failed attempt.
      </P>
      <Code label="Delivery" code={ENVELOPE} {...cp} />
      <Ul>
        <li>
          <C>id</C> is a number that increases with each event. Use it as your idempotency key: delivery is at least once,
          and ordering across retries is not guaranteed.
        </li>
        <li>
          <C>createdAt</C> is when the change happened. The event is written in the same database transaction as the change
          it describes, so an event never exists for a change that rolled back.
        </li>
        <li>
          Amounts are minor units. Ids are hex.
        </li>
      </Ul>

      <H2 id="events">Event types</H2>
      <DataTable
        head={["Type", "When it fires", "What to do"]}
        caption="Event types"
        mono={[0]}
        rows={[
          ["allowance.issued", "An allowance was signed for a device", "Record the vault against `externalRef`"],
          ["allowance.closed", "Every declared payment arrived after a close, or the vault expired and its grace period ended", "Release any unspent funded value in your ledger"],
          ["allowance.revoked", "You revoked it, or fraud detection did", "Stop treating the vault as spendable"],
          ["payment.settled", "A payment was honoured and allocated", "Credit the merchant; book the source from the three `from*` fields"],
          ["payment.flagged", "As above, but the payment is implicated in a fork, chain break, overspend or after-close payment", "Pay the merchant, and open a review"],
          ["fraud.detected", "A serious fraud case was opened and the allowance revoked", "Freeze the account, start recovery"],
          ["loan.drawn", "Overdraft was drawn by a settled payment", "Create or increase the customer's loan and fee"],
          ["loan.repaid", "A hosted-ledger loan was fully repaid", "Close the loan record"],
        ]}
      />
      <P>
        A payment between two different partners produces <C>payment.settled</C> for both: one for the partner that
        issued the allowance and one for the partner whose merchant was paid.
      </P>

      <H2 id="payloads">Payloads</H2>
      <P>
        The <C>data</C> field of each event. The <C>fromFunded</C>, <C>fromCredit</C> and <C>fromRiskPool</C> fields always add
        up to <C>amount</C>.
      </P>
      <Code label="data by type" code={PAYLOADS} {...cp} />

      <H2 id="signature">Verifying the signature</H2>
      <P>Every request carries two headers:</P>
      <Ul>
        <li>
          <C>x-payvault-timestamp</C>: Unix seconds when this attempt was sent.
        </li>
        <li>
          <C>x-payvault-signature</C>: lowercase hex HMAC-SHA256, keyed with your webhook secret, of the string{" "}
          <C>{"`${timestamp}.${body}`"}</C>, where <C>body</C> is the raw request body exactly as received.
        </li>
      </Ul>
      <Ol>
        <li>Read the raw body before any JSON parsing or re-serialising.</li>
        <li>Reject if the timestamp is more than a few minutes from your clock, which limits replay.</li>
        <li>Recompute the HMAC, compare in constant time, and reject on mismatch.</li>
        <li>Only then parse the JSON, process by <C>id</C> idempotently, and return 2xx.</li>
      </Ol>
      <Code label="Node.js (Express)" code={VERIFY} {...cp} />
      <Callout tone="warn" title="No secret, no signature">
        If no webhook secret is configured, the signature header is sent empty. Always configure a secret and reject
        unsigned requests.
      </Callout>

      <H2 id="retries">Retries</H2>
      <P>
        Failed events stay queued. They are attempted again on each delivery run, oldest first, up to 12 attempts in total.
        After the twelfth failure PayVault stops pushing that event. The failure is recorded, and the event remains
        available from the events feed, so nothing is lost. Return 2xx quickly and do the heavy work afterwards; a slow
        handler looks like a failure.
      </P>

      <H2 id="pull">Pulling instead</H2>
      <P>
        You can use the feed instead of, or as well as, webhooks. It returns the same events in id order, and a cursor
        makes it safe to resume after downtime. A common pattern is to receive webhooks for speed and poll once every few
        minutes from your last processed id to close any gap.
      </P>
      <Code label="GET /api/v1/events" code={PULL} {...cp} />
      <H3>Resuming after downtime</H3>
      <P>
        Ids increase but are not guaranteed to be consecutive for your account, so do not treat a jump as a lost event.
        Store the highest id you have fully processed, and after an outage call the feed with{" "}
        <C>after</C> set to it.
      </P>
    </article>
  );
}
