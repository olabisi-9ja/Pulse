import { fromBase64Url, toHex } from "@payvault/protocol";
import { z } from "zod";
import { closeWithStatement } from "@/lib/server/allowances";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zB64u } from "@/lib/server/http";

const Body = z.object({ close: zB64u });

export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const body = await parseBody(req, Body);
  const a = await db().begin((tx) => closeWithStatement(tx, fromBase64Url(body.close), { userId: user.id }));
  return json({ allowanceId: toHex(a.id), status: a.status, refunded: a.refunded });
});
