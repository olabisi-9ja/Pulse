import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { errorResponse, handle, json, parseBody } from "@/lib/server/http";
import { linkPhone, normalizePhone } from "@/lib/server/identity";

const Body = z.object({ phone: z.string().max(24), pin: z.string().regex(/^[0-9]{4,6}$/) });

/** Links a phone number (with its own PIN) for USSD and SMS. */
export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const body = await parseBody(req, Body);
  const phone = normalizePhone(body.phone);
  if (!phone) return errorResponse("bad_phone", "Use the international format, e.g. +2348012345678", 400);
  try {
    await db().begin((tx) => linkPhone(tx, user.id, phone, body.pin));
  } catch (err) {
    return errorResponse("phone_taken", err instanceof Error ? err.message : "Could not link", 409);
  }
  return json({ phone });
});
