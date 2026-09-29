import { encodeAllowance, toBase64Url } from "@payvault/protocol";
import { z } from "zod";
import { issueForUser } from "@/lib/server/allowances";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({
  deviceId: z.uuid(),
  funded: z.number().int().min(0).max(1_000_000_000),
  credit: z.number().int().min(0).max(1_000_000_000),
});

export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const body = await parseBody(req, Body);
  const cert = await db().begin((tx) => issueForUser(tx, { userId: user.id, ...body }));
  return json({ cert: toBase64Url(encodeAllowance(cert)) });
});
