import "server-only";
import { ServiceError } from "./allowances";
import { authenticateApiKey } from "./apikeys";
import { db } from "./db";
import type { Partner } from "./identity";

export async function requirePartner(req: Request): Promise<Partner> {
  const partner = await authenticateApiKey(db(), req.headers.get("authorization"));
  if (!partner) throw new ServiceError("unauthorized", "Missing or invalid API key", 401);
  return partner;
}
