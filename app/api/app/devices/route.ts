import { fromHex } from "@payvault/protocol";
import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zHex } from "@/lib/server/http";
import { registerDevice } from "@/lib/server/identity";

const Body = z.object({ publicKey: zHex(33), label: z.string().max(60).default("") });

export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const body = await parseBody(req, Body);
  const device = await db().begin((tx) => registerDevice(tx, user.id, fromHex(body.publicKey), body.label));
  return json({ deviceId: device.id });
});
