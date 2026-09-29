import { z } from "zod";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/ratelimit";

const Body = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  organisation: z.string().trim().min(1).max(160),
  organisationType: z.enum(["bank", "mmo", "fintech", "psp", "platform", "ngo", "transit", "government", "other"]),
  country: z.string().max(2).optional().default(""),
  monthlyVolume: z.enum(["unknown", "lt-10k", "10k-100k", "100k-1m", "gt-1m"]).optional().default("unknown"),
  message: z.string().max(4000).optional().default(""),
  locale: z.enum(["en", "fr"]).optional().default("en"),
});

/** Pilot requests from the marketing site. Visible to PayVault admins in the database. */
export const POST = handle(async (req: Request) => {
  await rateLimit(`contact:${clientIp(req)}`, 5, 600);
  const b = await parseBody(req, Body);
  await db()`
    insert into pv.contact_requests (name, email, organisation, organisation_type, country, monthly_volume, message, locale)
    values (${b.name}, ${b.email}, ${b.organisation}, ${b.organisationType}, ${b.country || null}, ${b.monthlyVolume},
            ${b.message || null}, ${b.locale})`;
  return json({ ok: true }, { status: 201 });
});
