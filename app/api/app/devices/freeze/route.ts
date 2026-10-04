import { z } from "zod";
import { freezeDevice } from "@/lib/server/allowances";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({ deviceId: z.uuid() });

/** Lost or stolen phone: revoke its offline vault and block it from loading another. */
export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const body = await parseBody(req, Body);
  return json(await db().begin((tx) => freezeDevice(tx, user.id, body.deviceId)));
});
