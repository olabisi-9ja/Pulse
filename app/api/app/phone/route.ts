import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { errorResponse, handle, json, parseBody } from "@/lib/server/http";
import { normalizePhone, startPhoneLink } from "@/lib/server/identity";

const Body = z.object({ phone: z.string().max(24), pin: z.string().regex(/^[0-9]{4,6}$/) });

/** Starts linking a phone number (with its own PIN) for USSD and SMS; finished over USSD. */
export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const body = await parseBody(req, Body);
  const phone = normalizePhone(body.phone);
  if (!phone) return errorResponse("bad_phone", "Use the international format, e.g. +2348012345678", 400);
  const code = await db().begin((tx) => startPhoneLink(tx, user.id, phone, body.pin));
  // Shown to the signed-in owner; proof of the number comes from entering it over USSD from that phone.
  return json({ phone, code });
});
