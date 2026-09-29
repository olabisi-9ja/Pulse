import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zAmount } from "@/lib/server/http";
import { sendToUser } from "@/lib/server/money";

const Body = z.object({ email: z.email(), amount: zAmount, note: z.string().max(80).default("") });

export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const body = await parseBody(req, Body);
  await db().begin((tx) => sendToUser(tx, user.id, body.email, body.amount, body.note));
  return json({ ok: true });
});
