/** Merchant-side offline verification of a payment bundle. */
import { allowanceGenesis, nowSeconds, paymentId, verifyAllowanceSignature, verifyPaymentSignature } from "./allowance";
import { equals, toHex } from "./bytes";
import { importPublicKey } from "./crypto";
import { type AllowanceCert, type Bundle, capOf, type Payment, type PaymentRequest } from "./types";

export type RejectCode =
  | "unknown_issuer"
  | "bad_issuer_signature"
  | "not_yet_valid"
  | "expired"
  | "revoked"
  | "wrong_allowance"
  | "bad_payer_signature"
  | "wrong_merchant"
  | "request_mismatch"
  | "nonce_reused"
  | "bad_amount"
  | "over_tx_limit"
  | "over_cap"
  | "too_many_payments"
  | "bad_chain"
  | "duplicate"
  | "fork"
  | "inconsistent";

export type SeenPayment = { id: string; payment: Payment };

export type VerifyContext = {
  /** Issuer public keys by key id, as cached from the last sync. */
  issuerKey: (kid: number) => Promise<CryptoKey | undefined> | CryptoKey | undefined;
  isRevoked?: (allowanceIdHex: string) => boolean;
  merchantId: Uint8Array;
  /** The request this payment must answer. Omit only for static-QR flows. */
  request?: PaymentRequest;
  /** Payments this merchant already holds from the same allowance. */
  seen?: SeenPayment[];
  isNonceUsed?: (nonceHex: string) => boolean;
  now?: number;
  /** Tolerated clock skew in seconds. Device clocks are not trusted. */
  skew?: number;
};

export type VerifyResult =
  | { ok: true; id: string; payment: Payment; cert: AllowanceCert; creditDrawn: number }
  | { ok: false; code: RejectCode; id?: string; conflictsWith?: string };

export async function verifyBundle(bundle: Bundle, ctx: VerifyContext): Promise<VerifyResult> {
  const { cert, payment: p } = bundle;
  const now = ctx.now ?? nowSeconds();
  const skew = ctx.skew ?? 300;
  const fail = (code: RejectCode, extra: Partial<Extract<VerifyResult, { ok: false }>> = {}): VerifyResult => ({
    ok: false,
    code,
    ...extra,
  });

  const issuer = await ctx.issuerKey(cert.issuerKid);
  if (!issuer) return fail("unknown_issuer");
  if (!(await verifyAllowanceSignature(cert, issuer))) return fail("bad_issuer_signature");
  if (cert.issuedAt > now + skew) return fail("not_yet_valid");
  if (now > cert.expiresAt + skew) return fail("expired");
  const allowanceHex = toHex(cert.allowanceId);
  if (ctx.isRevoked?.(allowanceHex)) return fail("revoked");
  if (!equals(p.allowanceId, cert.allowanceId)) return fail("wrong_allowance");

  const devicePub = await importPublicKey(cert.devicePub);
  if (!(await verifyPaymentSignature(p, devicePub))) return fail("bad_payer_signature");
  const id = toHex(await paymentId(p));

  if (!equals(p.merchantId, ctx.merchantId)) return fail("wrong_merchant", { id });
  if (ctx.request) {
    const q = ctx.request;
    if (!equals(q.nonce, p.nonce) || q.amount !== p.amount || q.currency !== cert.currency) {
      return fail("request_mismatch", { id });
    }
  }

  if (p.amount <= 0 || p.cumulative < p.amount || p.seq < 1) return fail("bad_amount", { id });
  if (p.amount > cert.perTxLimit) return fail("over_tx_limit", { id });
  if (p.cumulative > capOf(cert)) return fail("over_cap", { id });
  if (p.seq > cert.maxPayments) return fail("too_many_payments", { id });
  if (p.seq === 1 && (p.cumulative !== p.amount || !equals(p.prevHash, await allowanceGenesis(cert)))) {
    return fail("bad_chain", { id });
  }

  for (const s of ctx.seen ?? []) {
    const q = s.payment;
    if (s.id === id) return fail("duplicate", { id, conflictsWith: s.id });
    if (q.seq === p.seq) return fail("fork", { id, conflictsWith: s.id });
    const consistent =
      q.seq < p.seq ? p.cumulative - p.amount >= q.cumulative : q.cumulative - q.amount >= p.cumulative;
    if (!consistent) return fail("inconsistent", { id, conflictsWith: s.id });
    if (q.seq === p.seq - 1 && s.id !== toHex(p.prevHash)) return fail("fork", { id, conflictsWith: s.id });
    if (q.seq === p.seq + 1 && toHex(q.prevHash) !== id) return fail("fork", { id, conflictsWith: s.id });
  }
  if (ctx.isNonceUsed?.(toHex(p.nonce))) return fail("nonce_reused", { id });

  const creditDrawn = Math.max(0, p.cumulative - cert.funded) - Math.max(0, p.cumulative - p.amount - cert.funded);
  return { ok: true, id, payment: p, cert, creditDrawn };
}
