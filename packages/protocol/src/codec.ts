/**
 * Fixed-layout binary encoding. Deterministic by construction, so the bytes
 * that are signed are exactly the bytes that are sent.
 *
 * Allowance body (82 B): ver, type, allowanceId[16], issuerKid u32, devicePub[33],
 *   country[2], currency[3], funded u32, credit u32, perTxLimit u32,
 *   maxPayments u16, issuedAt u32, expiresAt u32
 * Payment body (64 B): ver, type, allowanceId[16], seq u16, amount u32,
 *   cumulative u32, merchantId[8], nonce[8], time u32, prevHash[16]
 * Request: ver, type, merchantId[8], currency[3], amount u32, nonce[8], time u32, name (u8 len + utf8 <= 32)
 * Bundle: ver, type, allowance (body+sig), payment (body+sig)
 */
import { concat, ProtocolError, Reader, Writer } from "./bytes";
import {
  type AllowanceCert,
  type Bundle,
  type CloseStatement,
  MsgType,
  type Payment,
  type PaymentRequest,
  PROTOCOL_VERSION,
  SIZES,
} from "./types";

function header(r: Reader, type: number) {
  const v = r.u8();
  if (v !== PROTOCOL_VERSION) throw new ProtocolError("bad_version", `Unsupported protocol version ${v}`);
  const t = r.u8();
  if (t !== type) throw new ProtocolError("bad_type", `Expected message type ${type}, got ${t}`);
}

export function encodeAllowanceBody(c: Omit<AllowanceCert, "sig">): Uint8Array {
  return new Writer()
    .u8(PROTOCOL_VERSION)
    .u8(MsgType.Allowance)
    .bytes(c.allowanceId, SIZES.allowanceId)
    .u32(c.issuerKid)
    .bytes(c.devicePub, SIZES.publicKey)
    .ascii(c.country, 2)
    .ascii(c.currency, 3)
    .u32(c.funded)
    .u32(c.credit)
    .u32(c.perTxLimit)
    .u16(c.maxPayments)
    .u32(c.issuedAt)
    .u32(c.expiresAt)
    .finish();
}

export function encodeAllowance(c: AllowanceCert): Uint8Array {
  return concat(encodeAllowanceBody(c), checkSig(c.sig));
}

function readAllowance(r: Reader): AllowanceCert {
  header(r, MsgType.Allowance);
  return {
    allowanceId: r.bytes(SIZES.allowanceId),
    issuerKid: r.u32(),
    devicePub: r.bytes(SIZES.publicKey),
    country: r.ascii(2),
    currency: r.ascii(3),
    funded: r.u32(),
    credit: r.u32(),
    perTxLimit: r.u32(),
    maxPayments: r.u16(),
    issuedAt: r.u32(),
    expiresAt: r.u32(),
    sig: r.bytes(SIZES.signature),
  };
}

export function decodeAllowance(b: Uint8Array): AllowanceCert {
  const r = new Reader(b);
  const c = readAllowance(r);
  r.done();
  return c;
}

export function encodePaymentBody(p: Omit<Payment, "sig">): Uint8Array {
  return new Writer()
    .u8(PROTOCOL_VERSION)
    .u8(MsgType.Payment)
    .bytes(p.allowanceId, SIZES.allowanceId)
    .u16(p.seq)
    .u32(p.amount)
    .u32(p.cumulative)
    .bytes(p.merchantId, SIZES.merchantId)
    .bytes(p.nonce, SIZES.nonce)
    .u32(p.time)
    .bytes(p.prevHash, SIZES.hash)
    .finish();
}

export function encodePayment(p: Payment): Uint8Array {
  return concat(encodePaymentBody(p), checkSig(p.sig));
}

function readPayment(r: Reader): Payment {
  header(r, MsgType.Payment);
  return {
    allowanceId: r.bytes(SIZES.allowanceId),
    seq: r.u16(),
    amount: r.u32(),
    cumulative: r.u32(),
    merchantId: r.bytes(SIZES.merchantId),
    nonce: r.bytes(SIZES.nonce),
    time: r.u32(),
    prevHash: r.bytes(SIZES.hash),
    sig: r.bytes(SIZES.signature),
  };
}

export function decodePayment(b: Uint8Array): Payment {
  const r = new Reader(b);
  const p = readPayment(r);
  r.done();
  return p;
}

export function encodeRequest(q: PaymentRequest): Uint8Array {
  return new Writer()
    .u8(PROTOCOL_VERSION)
    .u8(MsgType.Request)
    .bytes(q.merchantId, SIZES.merchantId)
    .ascii(q.currency, 3)
    .u32(q.amount)
    .bytes(q.nonce, SIZES.nonce)
    .u32(q.time)
    .utf8(q.name, 32)
    .finish();
}

export function decodeRequest(b: Uint8Array): PaymentRequest {
  const r = new Reader(b);
  header(r, MsgType.Request);
  const q = {
    merchantId: r.bytes(SIZES.merchantId),
    currency: r.ascii(3),
    amount: r.u32(),
    nonce: r.bytes(SIZES.nonce),
    time: r.u32(),
    name: r.utf8(),
  };
  r.done();
  return q;
}

export function encodeBundle(b: Bundle): Uint8Array {
  return concat(Uint8Array.of(PROTOCOL_VERSION, MsgType.Bundle), encodeAllowance(b.cert), encodePayment(b.payment));
}

export function decodeBundle(b: Uint8Array): Bundle {
  const r = new Reader(b);
  header(r, MsgType.Bundle);
  const cert = readAllowance(r);
  const payment = readPayment(r);
  r.done();
  return { cert, payment };
}

/** Reads the message type of an encoded message without decoding it. */
export function peekType(b: Uint8Array): number {
  if (b.length < 2) throw new ProtocolError("truncated", "Payload is truncated");
  return b[1];
}

function checkSig(sig: Uint8Array): Uint8Array {
  if (sig.length !== SIZES.signature) throw new ProtocolError("bad_signature", "Signature must be 64 bytes");
  return sig;
}

export function encodeCloseBody(c: Omit<CloseStatement, "sig">): Uint8Array {
  return new Writer()
    .u8(PROTOCOL_VERSION)
    .u8(MsgType.Close)
    .bytes(c.allowanceId, SIZES.allowanceId)
    .u16(c.seq)
    .u32(c.cumulative)
    .u32(c.time)
    .finish();
}

export function encodeClose(c: CloseStatement): Uint8Array {
  return concat(encodeCloseBody(c), checkSig(c.sig));
}

export function decodeClose(b: Uint8Array): CloseStatement {
  const r = new Reader(b);
  header(r, MsgType.Close);
  const c = {
    allowanceId: r.bytes(SIZES.allowanceId),
    seq: r.u16(),
    cumulative: r.u32(),
    time: r.u32(),
    sig: r.bytes(SIZES.signature),
  };
  r.done();
  return c;
}
