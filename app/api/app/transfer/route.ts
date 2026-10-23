import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/ratelimit";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zAmount } from "@/lib/server/http";
import { sendToUser } from "@/lib/server/money";

const Body = z.object({ to: z.string().trim().min(3).max(200), amount: zAmount, note: z.string().max(80).default("") });

export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  await rateLimit(`transfer:${user.id}`, 30, 60);
  const body = await parseBody(req, Body);
  await db().begin((tx) => sendToUser(tx, user.id, body.to, body.amount, body.note));
  return json({ ok: true });
});
