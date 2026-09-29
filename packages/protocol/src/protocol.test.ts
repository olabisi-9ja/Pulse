import { describe, expect, it } from "vitest";
import {
  allowanceGenesis,
  analyzeAllowance,
  base45Decode,
  base45Encode,
  bundleToQr,
  canSpend,
  compressPoint,
  createRequest,
  decodeAllowance,
  decodeClose,
  encodeClose,
  importPublicKey,
  signClose,
  verifyCloseSignature,
  decodePayment,
  decompressPoint,
  encodeAllowance,
  encodeBundle,
  encodePayment,
  exportPublicKey,
  generateKeyPair,
  initWalletState,
  issueAllowance,
  parseQr,
  randomBytes,
  requestToQr,
  signPayment,
  splitDraw,
  toHex,
  verifyBundle,
  walletBalance,
  type AllowanceCert,
  type Bundle,
  type SeenPayment,
  type VerifyContext,
  type WalletState,
} from "./index";

const NOW = 1_800_000_000;

async function setup(opts: { funded?: number; credit?: number; perTx?: number } = {}) {
  const issuer = await generateKeyPair();
  const device = await generateKeyPair();
  const cert = await issueAllowance(issuer.privateKey, {
    issuerKid: 7,
    devicePub: await exportPublicKey(device.publicKey),
    country: "NG",
    currency: "NGN",
    funded: opts.funded ?? 30_000_00,
    credit: opts.credit ?? 10_000_00,
    perTxLimit: opts.perTx ?? 15_000_00,
    maxPayments: 200,
    issuedAt: NOW,
    expiresAt: NOW + 72 * 3600,
  });
  const merchantA = randomBytes(8);
  const merchantB = randomBytes(8);
  const ctx = (merchantId: Uint8Array, extra: Partial<VerifyContext> = {}): VerifyContext => ({
    issuerKey: (kid) => (kid === 7 ? issuer.publicKey : undefined),
    merchantId,
    now: NOW + 60,
    ...extra,
  });
  return { issuer, device, cert, merchantA, merchantB, ctx, state: await initWalletState(cert) };
}

async function pay(device: CryptoKeyPair, state: WalletState, merchant: Uint8Array, amount: number) {
  const request = createRequest(merchant, amount, "NGN", "Mama Put", NOW + 30);
  const signed = await signPayment(device.privateKey, state, request, NOW + 40);
  return { ...signed, request, bundle: { cert: state.cert, payment: signed.payment } as Bundle };
}

describe("encoding", () => {
  it("round-trips base45 including odd lengths", () => {
    for (const len of [0, 1, 2, 3, 17, 280]) {
      const b = randomBytes(len);
      expect(base45Decode(base45Encode(b))).toEqual(b);
    }
    expect(base45Encode(new TextEncoder().encode("AB"))).toBe("BB8");
  });

  it("compresses and decompresses P-256 points", async () => {
    for (let i = 0; i < 5; i++) {
      const kp = await generateKeyPair(true);
      const raw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
      expect(decompressPoint(compressPoint(raw))).toEqual(raw);
    }
  });

  it("round-trips allowance and payment and keeps QR payloads small", async () => {
    const { cert, device, state, merchantA } = await setup();
    expect(decodeAllowance(encodeAllowance(cert))).toEqual(cert);
    const { payment, bundle, request } = await pay(device, state, merchantA, 500_00);
    expect(decodePayment(encodePayment(payment))).toEqual(payment);
    expect(encodeBundle(bundle).length).toBe(2 + 146 + 128);
    const qr = bundleToQr(bundle);
    expect(qr.length).toBeLessThan(430);
    expect(qr).toMatch(/^[0-9A-Z $%*+\-./:]+$/);
    expect(parseQr(qr)).toEqual({ kind: "bundle", bundle });
    expect(parseQr(requestToQr(request))).toEqual({ kind: "request", request });
  });

  it("rejects non-PayVault codes", () => {
    expect(() => parseQr("https://example.com")).toThrow(/Not a PayVault/);
  });
});

describe("wallet", () => {
  it("spends funded value first, then the overdraft", async () => {
    const { state, device, merchantA } = await setup({ funded: 1000, credit: 500, perTx: 1500 });
    expect(splitDraw(state, 1200)).toEqual({ fromFunded: 1000, fromCredit: 200 });
    const r = await pay(device, state, merchantA, 1200);
    expect(walletBalance(r.state)).toMatchObject({ spent: 1200, creditUsed: 200, creditRemaining: 300, remaining: 300 });
  });

  it("enforces cap, per-payment limit, currency and expiry", async () => {
    const { state } = await setup({ funded: 1000, credit: 0, perTx: 800 });
    expect(canSpend(state, 900, "NGN", NOW)).toMatchObject({ ok: false, code: "over_tx_limit" });
    expect(canSpend(state, 100, "KES", NOW)).toMatchObject({ ok: false, code: "currency_mismatch" });
    expect(canSpend(state, 100, "NGN", NOW + 73 * 3600)).toMatchObject({ ok: false, code: "expired" });
    const spent = { ...state, cumulative: 950 };
    expect(canSpend(spent, 100, "NGN", NOW)).toMatchObject({ ok: false, code: "over_cap" });
  });

  it("chains payments", async () => {
    const { state, device, merchantA } = await setup();
    const a = await pay(device, state, merchantA, 100);
    const b = await pay(device, a.state, merchantA, 200);
    expect(a.payment.prevHash).toEqual(await allowanceGenesis(state.cert));
    expect(b.payment.prevHash).toEqual(a.id);
    expect(b.payment).toMatchObject({ seq: 2, cumulative: 300 });
  });
});

describe("merchant verification", () => {
  it("accepts a valid payment and reports overdraft drawn", async () => {
    const { state, device, merchantA, ctx } = await setup({ funded: 1000, credit: 500, perTx: 1500 });
    const r = await pay(device, state, merchantA, 1200);
    const res = await verifyBundle(r.bundle, ctx(merchantA, { request: r.request }));
    expect(res).toMatchObject({ ok: true, creditDrawn: 200 });
  });

  it("rejects tampering with any payment field", async () => {
    const { state, device, merchantA, ctx } = await setup();
    const r = await pay(device, state, merchantA, 100);
    const tampered: Bundle[] = [
      { ...r.bundle, payment: { ...r.payment, amount: 1 } },
      { ...r.bundle, payment: { ...r.payment, cumulative: 1 } },
      { ...r.bundle, payment: { ...r.payment, seq: 9 } },
      { ...r.bundle, payment: { ...r.payment, time: 1 } },
    ];
    for (const b of tampered) {
      expect(await verifyBundle(b, ctx(merchantA))).toMatchObject({ ok: false, code: "bad_payer_signature" });
    }
  });

  it("rejects a forged allowance", async () => {
    const { state, device, merchantA, ctx } = await setup();
    const r = await pay(device, state, merchantA, 100);
    const forged: AllowanceCert = { ...r.bundle.cert, credit: 99_999_999 };
    expect(await verifyBundle({ ...r.bundle, cert: forged }, ctx(merchantA))).toMatchObject({
      ok: false,
      code: "bad_issuer_signature",
    });
    const rogue = await generateKeyPair();
    const selfIssued = await issueAllowance(rogue.privateKey, { ...r.bundle.cert, issuerKid: 7 });
    expect(await verifyBundle({ ...r.bundle, cert: selfIssued }, ctx(merchantA))).toMatchObject({
      ok: false,
      code: "bad_issuer_signature",
    });
  });

  it("rejects replay at another merchant, request mismatch, nonce reuse, revoked and expired", async () => {
    const { state, device, merchantA, merchantB, ctx } = await setup();
    const r = await pay(device, state, merchantA, 100);
    expect(await verifyBundle(r.bundle, ctx(merchantB))).toMatchObject({ code: "wrong_merchant" });
    const other = createRequest(merchantA, 100, "NGN", "x");
    expect(await verifyBundle(r.bundle, ctx(merchantA, { request: other }))).toMatchObject({
      code: "request_mismatch",
    });
    expect(await verifyBundle(r.bundle, ctx(merchantA, { isNonceUsed: () => true }))).toMatchObject({
      code: "nonce_reused",
    });
    const hex = toHex(state.cert.allowanceId);
    expect(await verifyBundle(r.bundle, ctx(merchantA, { isRevoked: (id) => id === hex }))).toMatchObject({
      code: "revoked",
    });
    expect(await verifyBundle(r.bundle, ctx(merchantA, { now: NOW + 80 * 3600 }))).toMatchObject({ code: "expired" });
  });

  it("detects duplicate and forked payments at the same merchant", async () => {
    const { state, device, merchantA, ctx } = await setup();
    const a = await pay(device, state, merchantA, 100);
    const seen: SeenPayment[] = [{ id: toHex(a.id), payment: a.payment }];
    expect(await verifyBundle(a.bundle, ctx(merchantA, { seen }))).toMatchObject({ code: "duplicate" });
    // Cloned device replays from the same state: same seq, different payment.
    const clone = await pay(device, state, merchantA, 150);
    expect(await verifyBundle(clone.bundle, ctx(merchantA, { seen }))).toMatchObject({ code: "fork" });
    // A legitimate next payment passes.
    const b = await pay(device, a.state, merchantA, 100);
    expect(await verifyBundle(b.bundle, ctx(merchantA, { seen }))).toMatchObject({ ok: true });
  });
});

describe("reconciliation", () => {
  it("settles a clean chain and computes overdraft usage", async () => {
    const { state, device, merchantA, merchantB } = await setup({ funded: 1000, credit: 500, perTx: 1000 });
    const a = await pay(device, state, merchantA, 700);
    const b = await pay(device, a.state, merchantB, 600);
    const genesis = toHex(await allowanceGenesis(state.cert));
    const res = analyzeAllowance(state.cert, genesis, [
      { id: toHex(b.id), payment: b.payment },
      { id: toHex(a.id), payment: a.payment },
      { id: toHex(a.id), payment: a.payment },
    ]);
    expect(res).toMatchObject({ spent: 1300, fundedUsed: 1000, creditUsed: 300, overspend: 0, fraud: false });
    expect(res.honoured).toHaveLength(2);
    expect(res.contiguousTo).toBe(2);
  });

  it("flags a double-spend across merchants and measures the loss", async () => {
    const { state, device, merchantA, merchantB } = await setup({ funded: 1000, credit: 0, perTx: 1000 });
    const a = await pay(device, state, merchantA, 900);
    const cloned = await pay(device, state, merchantB, 900);
    const genesis = toHex(await allowanceGenesis(state.cert));
    const res = analyzeAllowance(state.cert, genesis, [
      { id: toHex(a.id), payment: a.payment },
      { id: toHex(cloned.id), payment: cloned.payment },
    ]);
    expect(res.fraud).toBe(true);
    expect(res.forks).toEqual([{ seq: 1, ids: expect.arrayContaining([toHex(a.id), toHex(cloned.id)]) }]);
    expect(res.overspend).toBe(800);
    expect(res.honoured).toHaveLength(2);
  });
});

describe("close statement", () => {
  it("signs and verifies where the device stopped", async () => {
    const { state, device, merchantA } = await setup();
    const a = await pay(device, state, merchantA, 250);
    const close = await signClose(device.privateKey, a.state, NOW + 100);
    const decoded = decodeClose(encodeClose(close));
    expect(decoded).toMatchObject({ seq: 1, cumulative: 250 });
    const pub = await importPublicKey(state.cert.devicePub);
    expect(await verifyCloseSignature(decoded, pub)).toBe(true);
    expect(await verifyCloseSignature({ ...decoded, cumulative: 0 }, pub)).toBe(false);
  });
});
