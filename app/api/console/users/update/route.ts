import { z } from "zod";
import { ServiceError } from "@/lib/server/allowances";
import { requirePartnerRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({
  partnerId: z.guid(),
  userId: z.guid(),
  action: z.enum(["approve_tier2", "freeze", "unfreeze"]),
});

export const POST = handle(async (req: Request) => {
  const b = await parseBody(req, Body);
  await requirePartnerRole(b.partnerId, ["owner", "admin"]);
  const s = db();
  // Always scoped to the caller's partner: a user id from another partner matches no row.
  const rows =
    b.action === "approve_tier2"
      ? await s`update pv.users set kyc_tier = 'tier2' where id = ${b.userId} and partner_id = ${b.partnerId}
                and kyc_tier <> 'tier0' returning id`
      : await s`update pv.users set status = ${b.action === "freeze" ? "frozen" : "active"}
                where id = ${b.userId} and partner_id = ${b.partnerId} returning id`;
  if (!rows.length) {
    throw new ServiceError("not_found", b.action === "approve_tier2" ? "User not found or has not completed Tier 1" : "User not found", 404);
  }
  return json({ ok: true });
});
