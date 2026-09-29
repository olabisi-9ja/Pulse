/** Payer-side logic: spending an allowance offline. */
import { allowanceGenesis, nowSeconds, paymentId } from "./allowance";
import { ProtocolError, randomBytes } from "./bytes";
import { encodePaymentBody } from "./codec";
import { sign } from "./crypto";
import { type AllowanceCert, capOf, type Payment, type PaymentRequest, SIZES, type WalletState } from "./types";

export async function initWalletState(cert: AllowanceCert): Promise<WalletState> {
  return { cert, seq: 0, cumulative: 0, lastHash: await allowanceGenesis(cert) };
}

export type Balance = {
  cap: number;
  spent: number;
  remaining: number;
  /** Funded value still available. */
  fundedRemaining: number;
  /** Overdraft still available. */
  creditRemaining: number;
  /** Overdraft already drawn (owed after settlement). */
  creditUsed: number;
  paymentsLeft: number;
};

export function walletBalance(s: WalletState): Balance {
  const { funded, credit, maxPayments } = s.cert;
  const spent = s.cumulative;
  const creditUsed = Math.max(0, spent - funded);
  return {
    cap: capOf(s.cert),
    spent,
    remaining: capOf(s.cert) - spent,
    fundedRemaining: Math.max(0, funded - spent),
    creditRemaining: credit - creditUsed,
    creditUsed,
    paymentsLeft: maxPayments - s.seq,
  };
}

/** Splits an amount into the funded and overdraft parts it would draw. */
export function splitDraw(s: WalletState, amount: number): { fromFunded: number; fromCredit: number } {
  const fromFunded = Math.min(amount, Math.max(0, s.cert.funded - s.cumulative));
  return { fromFunded, fromCredit: amount - fromFunded };
}

export type SpendCheck = { ok: true } | { ok: false; code: string; message: string };

export function canSpend(s: WalletState, amount: number, currency: string, now = nowSeconds()): SpendCheck {
  const fail = (code: string, message: string): SpendCheck => ({ ok: false, code, message });
  if (!Number.isInteger(amount) || amount <= 0) return fail("bad_amount", "Amount must be a positive integer");
  if (currency !== s.cert.currency) return fail("currency_mismatch", `Allowance is in ${s.cert.currency}`);
  if (now > s.cert.expiresAt) return fail("expired", "Offline allowance has expired");
  if (amount > s.cert.perTxLimit) return fail("over_tx_limit", "Amount is above the offline per-payment limit");
  if (s.cumulative + amount > capOf(s.cert)) return fail("over_cap", "Not enough offline balance");
  if (s.seq + 1 > s.cert.maxPayments) return fail("too_many_payments", "Offline payment count limit reached");
  return { ok: true };
}

/**
 * Signs a payment against a merchant request. Returns the payment and the new
 * state; the caller MUST persist the new state before releasing the payment,
 * otherwise a crash could make the device reuse a sequence number (a fork).
 */
export async function signPayment(
  deviceKey: CryptoKey,
  state: WalletState,
  request: PaymentRequest,
  now = nowSeconds(),
): Promise<{ payment: Payment; state: WalletState; id: Uint8Array }> {
  const check = canSpend(state, request.amount, request.currency, now);
  if (!check.ok) throw new ProtocolError(check.code, check.message);
  if (request.merchantId.length !== SIZES.merchantId || request.nonce.length !== SIZES.nonce) {
    throw new ProtocolError("bad_request", "Malformed payment request");
  }
  const body = {
    allowanceId: state.cert.allowanceId,
    seq: state.seq + 1,
    amount: request.amount,
    cumulative: state.cumulative + request.amount,
    merchantId: request.merchantId,
    nonce: request.nonce,
    time: now,
    prevHash: state.lastHash,
  };
  const sig = await sign(deviceKey, encodePaymentBody(body));
  const id = await paymentId(body);
  return {
    payment: { ...body, sig },
    id,
    state: { ...state, seq: body.seq, cumulative: body.cumulative, lastHash: id },
  };
}

/** Merchant side: build a request to show as a QR. */
export function createRequest(
  merchantId: Uint8Array,
  amount: number,
  currency: string,
  name: string,
  now = nowSeconds(),
): PaymentRequest {
  if (!Number.isInteger(amount) || amount <= 0) throw new ProtocolError("bad_amount", "Amount must be positive");
  return { merchantId, amount, currency, nonce: randomBytes(SIZES.nonce), time: now, name };
}
