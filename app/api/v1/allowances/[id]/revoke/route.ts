import { fromHex } from "@payvault/protocol";
import { z } from "zod";
import { lockAllowance, revokeAllowance, ServiceError } from "@/lib/server/allowances";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";
import { requirePartner } from "@/lib/server/partner-api";

const Body = z.object({ reason: z.string().min(1).max(100).default("partner_request") });

export const POST = handle(async (req: Request, ctx: RouteContext<"/api/v1/allowances/[id]/revoke">) => {
  const partner = await requirePartner(req);
  const { id } = await ctx.params;
  if (!/^[0-9a-f]{32}$/.test(id)) throw new ServiceError("invalid_request", "Invalid allowance id");
  const { reason } = await parseBody(req, Body);
  await db().begin(async (tx) => {
    const a = await lockAllowance(tx, fromHex(id));
    if (!a || a.partner_id !== partner.id) throw new ServiceError("not_found", "Allowance not found", 404);
    await revokeAllowance(tx, a, reason);
  });
  return json({ id, status: "revoked" });
});
