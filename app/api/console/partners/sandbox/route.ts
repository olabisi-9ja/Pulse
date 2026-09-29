import { requireIdentity } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json } from "@/lib/server/http";
import { sandboxPartner } from "@/lib/server/identity";
import { ServiceError } from "@/lib/server/allowances";

/** Lets emails listed in PV_ADMIN_EMAILS join the shared sandbox partner as owner. */
export const POST = handle(async () => {
  const identity = await requireIdentity();
  const admins = (process.env.PV_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!admins.includes(identity.email.toLowerCase())) {
    throw new ServiceError("forbidden", "This email is not on the administrator list", 403);
  }
  const id = await db().begin(async (tx) => {
    const p = await sandboxPartner(tx);
    await tx`insert into pv.partner_members (partner_id, user_id, role) values (${p.id}, ${identity.id}, 'owner')
             on conflict (partner_id, user_id) do update set role = 'owner'`;
    return p.id;
  });
  return json({ ok: true, partnerId: id });
});
