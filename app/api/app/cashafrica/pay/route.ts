import { fromHex } from "@payvault/protocol";
import { z } from "zod";
import { requireAppUser } from "@/lib/server/auth";
import { executeTapPayment, TapPaymentError } from "@/lib/server/cashafrica";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, ServiceError, zAmount } from "@/lib/server/http";
import { userByEmail, userById, userByMerchantId } from "@/lib/server/identity";

const Body = z.object({
  merchantId: z.string().min(1),
  amount: zAmount,
  transport: z.enum(["nfc", "cashscan", "tap_simulate"]).default("nfc"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const POST = handle(async (req: Request) => {
  const payer = await requireAppUser();
  const body = await parseBody(req, Body);

  try {
    const txRes = await db().begin(async (tx) => {
      const id = body.merchantId.trim();
      let merchant;
      if (/^[0-9a-f]{16}$/i.test(id)) merchant = await userByMerchantId(tx, fromHex(id.toLowerCase()));
      else if (/^[0-9a-f-]{36}$/i.test(id)) merchant = await userById(tx, id);
      else if (id.includes("@")) merchant = await userByEmail(tx, id);
      if (!merchant) {
        throw new ServiceError("unknown_merchant", "Merchant not found", 404);
      }

      return executeTapPayment(tx, {
        payer,
        merchant,
        amount: body.amount,
        currency: payer.currency,
        transport: body.transport,
        metadata: body.metadata,
      });
    });

    return json({
      ok: true,
      ref: txRes.ref,
      status: txRes.status,
      amount: txRes.amount,
      currency: txRes.currency,
      transport: txRes.transport,
      settledAt: txRes.settledAt,
    });
  } catch (err) {
    if (err instanceof TapPaymentError) {
      throw new ServiceError(err.code, err.message, 400);
    }
    throw err;
  }
});

