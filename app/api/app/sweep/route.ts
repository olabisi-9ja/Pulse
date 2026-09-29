import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zAmount } from "@/lib/server/http";
import { sweepMerchant } from "@/lib/server/money";

const Body = z.object({ amount: zAmount.optional() });

export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const { amount } = await parseBody(req, Body);
  const moved = await db().begin((tx) => sweepMerchant(tx, user.id, amount));
  return json({ moved });
});
