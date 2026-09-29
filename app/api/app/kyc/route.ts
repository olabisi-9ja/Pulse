import { z } from "zod";
import { ServiceError } from "@/lib/server/allowances";
import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, parseBody } from "@/lib/server/http";
import { submitKyc } from "@/lib/server/identity";

const Body = z.object({ idType: z.string().min(2).max(20), idNumber: z.string().min(6).max(24) });

export const POST = handle(async (req: Request) => {
  const user = await requireAppUser();
  const body = await parseBody(req, Body);
  try {
    const tier = await db().begin((tx) => submitKyc(tx, user.id, body.idType, body.idNumber));
    return json({ tier });
  } catch (e) {
    throw new ServiceError("kyc_rejected", e instanceof Error ? e.message : "Verification failed");
  }
});
