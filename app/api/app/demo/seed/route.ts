import { demoMode, requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { seedDemoTrader } from "@/lib/server/demo";
import { errorResponse, handle, json } from "@/lib/server/http";

/** Pitch demo: three weeks of offline sales for the signed-in sandbox trader. */
export const POST = handle(async () => {
  if (process.env.NODE_ENV === "production" && !demoMode()) return errorResponse("disabled", "Demo data is disabled", 404);
  const user = await requireAppUser();
  return json(await seedDemoTrader(db(), user.id));
});
