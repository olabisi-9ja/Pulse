import { z } from "zod";
import { requirePartnerRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({
  partnerId: z.guid(),
  creditFeeBps: z.number().int().min(0).max(5000),
  creditTermDays: z.number().int().min(1).max(90),
});

export const POST = handle(async (req: Request) => {
  const b = await parseBody(req, Body);
  await requirePartnerRole(b.partnerId, ["owner", "admin"]);
  await db()`update pv.partners set credit_fee_bps = ${b.creditFeeBps}, credit_term_days = ${b.creditTermDays}
             where id = ${b.partnerId}`;
  return json({ ok: true });
});
