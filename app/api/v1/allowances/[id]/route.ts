import { fromHex, toHex } from "@payvault/protocol";
import { ServiceError } from "@/lib/server/allowances";
import { bytes, db } from "@/lib/server/db";
import { handle, json } from "@/lib/server/http";
import { requirePartner } from "@/lib/server/partner-api";

export const GET = handle(async (req: Request, ctx: RouteContext<"/api/v1/allowances/[id]">) => {
  const partner = await requirePartner(req);
  const { id } = await ctx.params;
  if (!/^[0-9a-f]{32}$/.test(id)) throw new ServiceError("invalid_request", "Invalid allowance id");
  const sql = db();
  const [a] = await sql`select * from pv.allowances where id = ${fromHex(id)} and partner_id = ${partner.id}`;
  if (!a) throw new ServiceError("not_found", "Allowance not found", 404);
  const cases = await sql`select kind, seq, loss, status, created_at, payment_ids from pv.fraud_cases where allowance_id = ${fromHex(id)}`;
  return json({
    id,
    externalRef: a.external_ref,
    status: a.status,
    currency: a.currency,
    funded: a.funded,
    credit: a.credit,
    settled: { funded: a.settled_funded, credit: a.settled_credit, riskPool: a.settled_loss, payments: a.payments_count },
    refunded: a.refunded,
    declared: a.declared_seq === null ? null : { seq: a.declared_seq, cumulative: a.declared_cumulative },
    expiresAt: a.expires_at,
    fraudCases: cases.map((c) => ({
      kind: c.kind,
      seq: c.seq,
      loss: c.loss,
      status: c.status,
      paymentIds: (c.payment_ids as Buffer[]).map((b) => toHex(bytes(b))),
      createdAt: c.created_at,
    })),
  });
});
