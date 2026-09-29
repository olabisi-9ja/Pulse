import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { repayFromWallet } from "@/lib/server/credit";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zAmount } from "@/lib/server/http";

const Body = z.object({ amount: zAmount.optional() });

export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const { amount } = await parseBody(req, Body);
  const repaid = await db().begin((tx) => repayFromWallet(tx, user.id, amount));
  return json({ repaid });
});
