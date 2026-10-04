import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json } from "@/lib/server/http";
import { maintenanceIfDue } from "@/lib/server/maintenance";
import { appSnapshot } from "@/lib/server/snapshot";

export const GET = handle(async () => {
  const user = await requireAppUser();
  maintenanceIfDue();
  return json(await appSnapshot(db(), user));
});
