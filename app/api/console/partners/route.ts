import { randomBytes, toHex } from "@payvault/protocol";
import { getCountryPack } from "@payvault/countries";
import { z } from "zod";
import { requireIdentity } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  kind: z.enum(["bank", "mmo", "fintech", "psp", "ngo"]),
  countries: z
    .array(z.string().length(2))
    .min(1, "select at least one country")
    .max(60)
    .refine((cs) => cs.every((c) => !!getCountryPack(c)), "unsupported country"),
  ledgerMode: z.enum(["hosted", "external"]),
});

const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "partner";

/** Creates a partner organisation; the caller becomes its owner. */
export const POST = handle(async (req: Request) => {
  const identity = await requireIdentity();
  const b = await parseBody(req, Body);
  const countries = [...new Set(b.countries.map((c) => c.toUpperCase()))];
  const id = await db().begin(async (tx) => {
    const slug = `${slugify(b.name)}-${toHex(randomBytes(3))}`;
    const [p] = await tx<{ id: string }[]>`
      insert into pv.partners (slug, name, kind, countries, ledger_mode)
      values (${slug}, ${b.name}, ${b.kind}, ${countries}, ${b.ledgerMode}) returning id`;
    await tx`insert into pv.partner_members (partner_id, user_id, role) values (${p.id}, ${identity.id}, 'owner')`;
    return p.id;
  });
  return json({ ok: true, partnerId: id });
});
