import { verifyCashAfricaWebhook } from "@/lib/server/cashafrica";
import { db } from "@/lib/server/db";
import { handle, json, ServiceError } from "@/lib/server/http";

export const POST = handle(async (req: Request) => {
  const rawBody = await req.text();
  const signature = req.headers.get("x-cashafrica-signature") ?? req.headers.get("x-signature");

  if (!verifyCashAfricaWebhook(rawBody, signature)) {
    throw new ServiceError("invalid_signature", "Webhook signature verification failed", 401);
  }

  let event: { event?: string; type?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    throw new ServiceError("invalid_json", "Invalid JSON payload", 400);
  }

  const eventType = event.event ?? event.type ?? "";
  const ref = event.data?.reference;

  if (ref && (eventType === "cashtap.payment.success" || eventType === "payment.success")) {
    await db()`
      update pv.cashafrica_transactions
      set status = 'completed', settled_at = now()
      where ref = ${ref} and status = 'pending'`;
  } else if (ref && (eventType === "cashtap.payment.failed" || eventType === "payment.failed")) {
    await db()`
      update pv.cashafrica_transactions
      set status = 'failed'
      where ref = ${ref} and status = 'pending'`;
  }

  return json({ received: true });
});

