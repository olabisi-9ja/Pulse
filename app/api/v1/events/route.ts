import { db } from "@/lib/server/db";
import { handle, json } from "@/lib/server/http";
import { requirePartner } from "@/lib/server/partner-api";

/** Pull-based event feed (same events as webhooks). Page with ?after=<id>. */
export const GET = handle(async (req: Request) => {
  const partner = await requirePartner(req);
  const url = new URL(req.url);
  const after = Number(url.searchParams.get("after") ?? 0) || 0;
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit") ?? 100)));
  const rows = await db()`
    select id, type, payload, created_at from pv.events
    where partner_id = ${partner.id} and id > ${after} order by id limit ${limit}`;
  return json({
    data: rows.map((e) => ({ id: Number(e.id), type: e.type, createdAt: e.created_at, data: e.payload })),
    nextAfter: rows.length ? Number(rows[rows.length - 1].id) : after,
  });
});
