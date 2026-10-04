import { requireAppUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { handle, json, ServiceError } from "@/lib/server/http";

export const GET = handle(async (req: Request) => {
  const user = await requireAppUser();
  const url = new URL(req.url);
  const ref = url.searchParams.get("ref");
  if (!ref) {
    throw new ServiceError("missing_ref", "Transaction reference is required", 400);
  }

  const [tx] = await db()<{
    id: string;
    ref: string;
    amount: number;
    currency: string;
    transport: string;
    status: string;
    created_at: Date;
    settled_at: Date | null;
  }[]>`
    select id, ref, amount, currency, transport, status, created_at, settled_at
    from pv.cashafrica_transactions
    where ref = ${ref} and (user_id = ${user.id} or merchant_user_id = ${user.id})
    limit 1`;

  if (!tx) {
    throw new ServiceError("not_found", "Transaction not found", 404);
  }

  return json({
    transaction: {
      id: tx.id,
      ref: tx.ref,
      amount: tx.amount,
      currency: tx.currency,
      transport: tx.transport,
      status: tx.status,
      createdAt: tx.created_at,
      settledAt: tx.settled_at,
    },
  });
});

