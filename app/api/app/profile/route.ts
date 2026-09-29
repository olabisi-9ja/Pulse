import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";
import { updateProfile } from "@/lib/server/identity";

const Body = z.object({ displayName: z.string().trim().min(1).max(60).optional(), locale: z.enum(["en", "fr"]).optional() });

export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const body = await parseBody(req, Body);
  await updateProfile(db(), user.id, body);
  return json({ ok: true });
});
