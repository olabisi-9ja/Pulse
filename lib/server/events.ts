import "server-only";
/** Partner webhook outbox. Events are written in the same transaction as the change they describe. */
import type { Db } from "./db";

export type EventType =
  | "allowance.issued"
  | "allowance.closed"
  | "allowance.revoked"
  | "payment.settled"
  | "payment.flagged"
  | "fraud.detected"
  | "loan.drawn"
  | "loan.repaid";

export async function emit(tx: Db, partnerId: string, type: EventType, payload: Record<string, unknown>) {
  await tx`insert into pv.events (partner_id, type, payload) values (${partnerId}, ${type}, ${tx.json(payload as never)})`;
}

async function hmac(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
  return [...sig].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Delivers pending events to partners with a webhook URL. Signed with HMAC-SHA256. */
export async function deliverEvents(tx: Db, limit = 100): Promise<{ delivered: number; failed: number }> {
  const rows = await tx<
    { id: number; type: string; payload: unknown; created_at: Date; webhook_url: string; webhook_secret: string | null }[]
  >`
    select e.id, e.type, e.payload, e.created_at, p.webhook_url, p.webhook_secret
    from pv.events e join pv.partners p on p.id = e.partner_id
    where e.delivered_at is null and p.webhook_url is not null and e.attempts < 12
    order by e.id limit ${limit}`;
  let delivered = 0;
  let failed = 0;
  for (const e of rows) {
    const body = JSON.stringify({ id: e.id, type: e.type, createdAt: e.created_at, data: e.payload });
    const ts = Math.floor(Date.now() / 1000);
    try {
      const res = await fetch(e.webhook_url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-payvault-timestamp": String(ts),
          "x-payvault-signature": e.webhook_secret ? await hmac(e.webhook_secret, `${ts}.${body}`) : "",
        },
        body,
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await tx`update pv.events set delivered_at = now(), attempts = attempts + 1 where id = ${e.id}`;
      delivered++;
    } catch (err) {
      await tx`update pv.events set attempts = attempts + 1, last_error = ${String(err).slice(0, 300)} where id = ${e.id}`;
      failed++;
    }
  }
  return { delivered, failed };
}
