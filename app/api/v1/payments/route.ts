import { toHex } from "@payvault/protocol";
import { bytes, db } from "@/lib/server/db";
import { handle, json } from "@/lib/server/http";
import { requirePartner } from "@/lib/server/partner-api";

export const GET = handle(async (req: Request) => {
  const partner = await requirePartner(req);
  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
  const before = url.searchParams.get("before");
  const beforeDate = before ? new Date(before) : new Date(Date.now() + 1000);
  const rows = await db()`
    select p.*, a.currency, a.external_ref from pv.payments p join pv.allowances a on a.id = p.allowance_id
    where (p.partner_id = ${partner.id}
       or p.merchant_user_id in (select id from pv.users where partner_id = ${partner.id}))
      and p.received_at < ${beforeDate}
    order by p.received_at desc limit ${limit}`;
  return json({
    data: rows.map((p) => ({
      id: toHex(bytes(p.id)),
      allowanceId: toHex(bytes(p.allowance_id)),
      externalRef: p.external_ref,
      seq: p.seq,
      amount: p.amount,
      currency: p.currency,
      merchantId: toHex(bytes(p.merchant_id)),
      fromFunded: p.from_funded,
      fromCredit: p.from_credit,
      fromRiskPool: p.from_risk_pool,
      status: p.status,
      receivedVia: p.received_via,
      deviceTime: p.device_time,
      receivedAt: p.received_at,
    })),
    nextBefore: rows.length === limit ? rows[rows.length - 1].received_at : null,
  });
});
