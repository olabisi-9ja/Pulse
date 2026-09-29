import { getCountryPack } from "@payvault/countries";
import { z } from "zod";
import { requireIdentity } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";
import { createUser } from "@/lib/server/identity";

const Body = z.object({
  displayName: z.string().trim().min(1).max(60),
  country: z.string().length(2).refine((c) => !!getCountryPack(c), "unsupported country"),
  locale: z.enum(["en", "fr"]),
});

export const POST = handle(async (req: Request) => {
  const identity = await requireIdentity();
  const body = await parseBody(req, Body);
  const user = await db().begin((tx) => createUser(tx, { id: identity.id, email: identity.email, ...body }));
  return json({ ok: true, userId: user.id });
});
