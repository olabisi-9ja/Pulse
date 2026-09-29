import { z } from "zod";
import { ServiceError } from "@/lib/server/allowances";
import { requirePartnerRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({ partnerId: z.guid(), userId: z.guid() });

export const POST = handle(async (req: Request) => {
  const b = await parseBody(req, Body);
  await requirePartnerRole(b.partnerId, ["owner"]);
  await db().begin(async (tx) => {
    const members = await tx<{ user_id: string; role: string }[]>`
      select user_id::text as user_id, role from pv.partner_members where partner_id = ${b.partnerId} for update`;
    const target = members.find((m) => m.user_id === b.userId.toLowerCase());
    if (!target) throw new ServiceError("not_found", "Member not found", 404);
    if (target.role === "owner" && members.filter((m) => m.role === "owner").length <= 1) {
      throw new ServiceError("last_owner", "An organisation needs at least one owner", 409);
    }
    await tx`delete from pv.partner_members where partner_id = ${b.partnerId} and user_id = ${b.userId}`;
  });
  return json({ ok: true });
});
