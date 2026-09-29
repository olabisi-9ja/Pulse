import { getCountryPack } from "@payvault/countries";
import { z } from "zod";
import { ServiceError } from "@/lib/server/allowances";
import { requirePartnerRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({
  partnerId: z.guid(),
  name: z.string().trim().min(2).max(80),
  kind: z.enum(["bank", "mmo", "fintech", "psp", "ngo"]).optional(),
  countries: z
    .array(z.string().length(2))
    .min(1, "select at least one country")
    .refine((cs) => cs.every((c) => !!getCountryPack(c)), "unsupported country"),
  ledgerMode: z.enum(["hosted", "external"]).optional(),
});

export const POST = handle(async (req: Request) => {
  const b = await parseBody(req, Body);
  await requirePartnerRole(b.partnerId, ["owner", "admin"]);
  const countries = [...new Set(b.countries.map((c) => c.toUpperCase()))];
  await db().begin(async (tx) => {
    const [p] = await tx<{ kind: string; ledger_mode: string }[]>`
      select kind, ledger_mode from pv.partners where id = ${b.partnerId} for update`;
    if (b.ledgerMode && b.ledgerMode !== p.ledger_mode) {
      const [{ n }] = await tx<{ n: number }[]>`select count(*)::int as n from pv.payments where partner_id = ${b.partnerId}`;
      if (n > 0) throw new ServiceError("ledger_locked", "Ledger mode cannot change once payments exist", 409);
    }
    // The sandbox keeps its kind.
    const kind = p.kind === "sandbox" ? "sandbox" : (b.kind ?? p.kind);
    await tx`update pv.partners set name = ${b.name}, kind = ${kind}, countries = ${countries},
             ledger_mode = ${b.ledgerMode ?? p.ledger_mode} where id = ${b.partnerId}`;
  });
  return json({ ok: true });
});
