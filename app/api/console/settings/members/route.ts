import { z } from "zod";
import { ServiceError } from "@/lib/server/allowances";
import { requirePartnerRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";
import { userByEmailOrPhone } from "@/lib/server/identity";

const Body = z.object({
  partnerId: z.guid(),
  email: z.string().trim().min(3).max(200),
  role: z.enum(["admin", "analyst"]),
});

/** Owner adds an existing PayVault user (looked up by email or phone) as admin or analyst. */
export const POST = handle(async (req: Request) => {
  const b = await parseBody(req, Body);
  await requirePartnerRole(b.partnerId, ["owner"]);
  await db().begin(async (tx) => {
    const user = await userByEmailOrPhone(tx, b.email);
    if (!user) throw new ServiceError("user_not_found", "No PayVault user has this email or phone. They must sign up first.", 404);
    const rows = await tx`
      insert into pv.partner_members (partner_id, user_id, role) values (${b.partnerId}, ${user.id}, ${b.role})
      on conflict (partner_id, user_id) do nothing returning user_id`;
    if (!rows.length) throw new ServiceError("already_member", "This user is already a member", 409);
  });
  return json({ ok: true });
});
