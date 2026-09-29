import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/ratelimit";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zAmount } from "@/lib/server/http";
import { sandboxTopUp } from "@/lib/server/money";

const Body = z.object({ amount: zAmount });

export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  await rateLimit(`topup:${user.id}`, 30, 60);
  const { amount } = await parseBody(req, Body);
  await db().begin((tx) => sandboxTopUp(tx, user.id, amount));
  return json({ ok: true });
});
