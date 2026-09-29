import { z } from "zod";
import { ServiceError } from "@/lib/server/allowances";
import { requirePartnerRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({ partnerId: z.guid(), id: z.guid(), status: z.enum(["open", "recovered", "written_off"]) });

export const POST = handle(async (req: Request) => {
  const b = await parseBody(req, Body);
  await requirePartnerRole(b.partnerId, ["owner", "admin"]);
  const rows = await db()`
    update pv.fraud_cases set status = ${b.status} where id = ${b.id} and partner_id = ${b.partnerId} returning id`;
  if (!rows.length) throw new ServiceError("not_found", "Case not found", 404);
  return json({ ok: true });
});
