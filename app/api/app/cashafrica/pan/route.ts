import { requireAppUser } from "@/lib/server/auth";
import { getOrProvisionPan } from "@/lib/server/cashafrica";
import { db } from "@/lib/server/db";
import { handle, json } from "@/lib/server/http";

export const GET = handle(async () => {
  const user = await requireAppUser();
  const pan = await db().begin((tx) => getOrProvisionPan(tx, user));
  return json({
    pan: {
      id: pan.id,
      maskedPan: pan.maskedPan,
      expiry: pan.expiry,
      status: pan.status,
      createdAt: pan.createdAt,
    },
  });
});

export const POST = handle(async () => {
  const user = await requireAppUser();
  const pan = await db().begin((tx) => getOrProvisionPan(tx, user));
  return json({
    pan: {
      id: pan.id,
      maskedPan: pan.maskedPan,
      expiry: pan.expiry,
      status: pan.status,
      createdAt: pan.createdAt,
    },
  });
});

