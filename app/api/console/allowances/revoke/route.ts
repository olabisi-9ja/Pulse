import { fromHex } from "@payvault/protocol";
import { z } from "zod";
import { lockAllowance, revokeAllowance, ServiceError } from "@/lib/server/allowances";
import { requirePartnerRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zHex } from "@/lib/server/http";

const Body = z.object({ partnerId: z.guid(), id: zHex(16), reason: z.string().trim().min(1).max(100).default("partner_revoked") });

export const POST = handle(async (req: Request) => {
  const b = await parseBody(req, Body);
  await requirePartnerRole(b.partnerId, ["owner", "admin"]);
  await db().begin(async (tx) => {
    const a = await lockAllowance(tx, fromHex(b.id));
    if (!a || a.partner_id !== b.partnerId.toLowerCase()) throw new ServiceError("not_found", "Allowance not found", 404);
    await revokeAllowance(tx, a, b.reason);
  });
  return json({ ok: true });
});
