import { toHex } from "@payvault/protocol";
import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";
import { enableMerchant } from "@/lib/server/identity";

const Body = z.object({ name: z.string().trim().min(1).max(32) });

export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const body = await parseBody(req, Body);
  const id = await db().begin((tx) => enableMerchant(tx, user.id, body.name));
  return json({ merchantId: toHex(id), name: body.name });
});
