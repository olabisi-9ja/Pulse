import { randomBytes } from "./bytes";
import { encodeAllowanceBody, encodeCloseBody, encodePaymentBody } from "./codec";
import { hash16, sign, verify } from "./crypto";
import { type AllowanceCert, type AllowanceParams, type CloseStatement, type Payment, SIZES } from "./types";

export const nowSeconds = () => Math.floor(Date.now() / 1000);

/** Partner side: sign an allowance certificate for a device. */
export async function issueAllowance(issuerKey: CryptoKey, params: AllowanceParams): Promise<AllowanceCert> {
  const body = {
    ...params,
    allowanceId: params.allowanceId ?? randomBytes(SIZES.allowanceId),
    issuedAt: params.issuedAt ?? nowSeconds(),
  };
  if (body.expiresAt <= body.issuedAt) throw new RangeError("expiresAt must be after issuedAt");
  if (body.perTxLimit <= 0 || body.maxPayments <= 0) throw new RangeError("Limits must be positive");
  if (body.funded + body.credit <= 0) throw new RangeError("Allowance must have spending power");
  const sig = await sign(issuerKey, encodeAllowanceBody(body));
  return { ...body, sig };
}

export async function verifyAllowanceSignature(cert: AllowanceCert, issuerPub: CryptoKey): Promise<boolean> {
  return verify(issuerPub, cert.sig, encodeAllowanceBody(cert));
}

/** Chain anchor: the prevHash of payment #1. */
export async function allowanceGenesis(cert: AllowanceCert): Promise<Uint8Array> {
  return hash16(encodeAllowanceBody(cert));
}

/** Stable payment id. Excludes the signature, so ECDSA malleability can't mint new ids. */
export async function paymentId(p: Omit<Payment, "sig">): Promise<Uint8Array> {
  return hash16(encodePaymentBody(p));
}

export async function verifyPaymentSignature(p: Payment, devicePub: CryptoKey): Promise<boolean> {
  return verify(devicePub, p.sig, encodePaymentBody(p));
}

export async function verifyCloseSignature(c: CloseStatement, devicePub: CryptoKey): Promise<boolean> {
  return verify(devicePub, c.sig, encodeCloseBody(c));
}
