/**
 * Local-first offline engine: the payer's vault, the merchant's queue, the
 * outbox of signed payments waiting to sync, and the cached network state
 * used to verify payments without a connection.
 */
import {
  bundleToQr,
  canSpend,
  createRequest,
  decodeAllowance,
  decodeBundle,
  encodeBundle,
  encodeClose,
  fromBase64Url,
  fromHex,
  importPublicKey,
  initWalletState,
  parseQr,
  type PaymentRequest,
  requestToQr,
  type SeenPayment,
  signClose,
  signPayment,
  splitDraw,
  toBase64Url,
  toHex,
  verifyBundle,
  type VerifyResult,
  walletBalance,
  type WalletState,
} from "@payvault/protocol";
import { kv } from "./kv";

// ---------- Network cache (issuer keys + revocations) ----------

export type NetworkCache = {
  issuerKeys: { kid: number; publicKey: string }[];
  revocations: { allowanceId: string }[];
  serverTime: number;
  fetchedAt: number;
};

export const getNetwork = () => kv.get<NetworkCache>("network");
export const saveNetwork = (n: Omit<NetworkCache, "fetchedAt">) => kv.set("network", { ...n, fetchedAt: Date.now() });

// ---------- Outbox: signed payments waiting to be settled ----------

export type OutboxItem = {
  id: string;
  role: "payer" | "merchant";
  bundle: string; // base64url
  allowanceId: string;
  seq: number;
  nonce: string;
  amount: number;
  currency: string;
  fromCredit: number;
  counterparty: string;
  createdAt: number;
  status: "pending" | "settled" | "flagged" | "duplicate" | "rejected";
  code?: string;
  syncedAt?: number;
};

const outboxKey = (u: string) => `outbox:${u}`;
export const getOutbox = async (u: string) => (await kv.get<OutboxItem[]>(outboxKey(u))) ?? [];

async function putOutbox(u: string, item: OutboxItem) {
  const items = await getOutbox(u);
  if (!items.some((i) => i.id === item.id && i.role === item.role)) items.unshift(item);
  await kv.set(outboxKey(u), items.slice(0, 1000));
}

export async function markOutbox(
  u: string,
  results: { id?: string; status: OutboxItem["status"]; code?: string }[],
  sent: OutboxItem[],
) {
  const items = await getOutbox(u);
  sent.forEach((s, i) => {
    const r = results[i];
    if (!r) return;
    for (const it of items) {
      if (it.id === s.id && it.role === s.role) {
        // A duplicate means the server already has it: settled from our point of view.
        it.status = r.status === "duplicate" ? ((r.code as OutboxItem["status"]) ?? "settled") : r.status;
        it.code = r.code;
        it.syncedAt = Date.now();
      }
    }
  });
  await kv.set(outboxKey(u), items);
}

export const pendingOutbox = async (u: string) => (await getOutbox(u)).filter((i) => i.status === "pending");

// ---------- Payer: the offline vault ----------

type StoredVault = { cert: string; seq: number; cumulative: number; lastHash: string };
const vaultKey = (u: string) => `vault:${u}`;

export async function loadVault(u: string): Promise<WalletState | null> {
  const v = await kv.get<StoredVault>(vaultKey(u));
  if (!v) return null;
  return { cert: decodeAllowance(fromBase64Url(v.cert)), seq: v.seq, cumulative: v.cumulative, lastHash: fromHex(v.lastHash) };
}

async function saveVault(u: string, s: WalletState, certB64: string) {
  await kv.set(vaultKey(u), { cert: certB64, seq: s.seq, cumulative: s.cumulative, lastHash: toHex(s.lastHash) });
}

export async function installVault(u: string, certB64: string): Promise<WalletState> {
  const state = await initWalletState(decodeAllowance(fromBase64Url(certB64)));
  await saveVault(u, state, certB64);
  return state;
}

export const clearVault = (u: string) => kv.del(vaultKey(u));

export function vaultSummary(s: WalletState | null) {
  if (!s) return null;
  return { ...walletBalance(s), currency: s.cert.currency, expiresAt: s.cert.expiresAt * 1000, allowanceId: toHex(s.cert.allowanceId) };
}

export type PayQuote =
  | { ok: true; request: PaymentRequest; fromFunded: number; fromCredit: number }
  | { ok: false; code: string };

export async function quotePayment(u: string, request: PaymentRequest): Promise<PayQuote> {
  const s = await loadVault(u);
  if (!s) return { ok: false, code: "no_vault" };
  const check = canSpend(s, request.amount, request.currency);
  if (!check.ok) return { ok: false, code: check.code };
  return { ok: true, request, ...splitDraw(s, request.amount) };
}

/**
 * Signs a payment, persists the new vault state and the outbox entry, and only
 * then returns the QR text. Persisting first means a crash can never make this
 * device reuse a sequence number.
 */
export async function payRequest(u: string, deviceKey: CryptoKey, request: PaymentRequest): Promise<{ qr: string; item: OutboxItem }> {
  const stored = await kv.get<StoredVault>(vaultKey(u));
  const s = await loadVault(u);
  if (!s || !stored) throw new Error("no_vault");
  const { fromCredit } = splitDraw(s, request.amount);
  const { payment, state, id } = await signPayment(deviceKey, s, request);
  const bundle = { cert: s.cert, payment };
  const item: OutboxItem = {
    id: toHex(id),
    role: "payer",
    bundle: toBase64Url(encodeBundle(bundle)),
    allowanceId: toHex(s.cert.allowanceId),
    seq: payment.seq,
    nonce: toHex(payment.nonce),
    amount: payment.amount,
    currency: s.cert.currency,
    fromCredit,
    counterparty: request.name,
    createdAt: Date.now(),
    status: "pending",
  };
  await saveVault(u, state, stored.cert);
  await putOutbox(u, item);
  return { qr: bundleToQr(bundle), item };
}

export async function signCloseStatement(u: string, deviceKey: CryptoKey): Promise<string> {
  const s = await loadVault(u);
  if (!s) throw new Error("no_vault");
  return toBase64Url(encodeClose(await signClose(deviceKey, s)));
}

// ---------- Merchant: requests and offline acceptance ----------

export type OpenRequest = { qr: string; request: string; amount: number; currency: string; createdAt: number };
const requestKey = (u: string) => `request:${u}`;

export async function openRequest(u: string, merchantIdHex: string, name: string, amount: number, currency: string) {
  const request = createRequest(fromHex(merchantIdHex), amount, currency, name);
  const open: OpenRequest = {
    qr: requestToQr(request),
    request: JSON.stringify({ ...request, merchantId: toHex(request.merchantId), nonce: toHex(request.nonce) }),
    amount,
    currency,
    createdAt: Date.now(),
  };
  await kv.set(requestKey(u), open);
  return open;
}

export const getOpenRequest = (u: string) => kv.get<OpenRequest>(requestKey(u));
export const cancelRequest = (u: string) => kv.del(requestKey(u));

function parseStoredRequest(o: OpenRequest): PaymentRequest {
  const r = JSON.parse(o.request);
  return { ...r, merchantId: fromHex(r.merchantId), nonce: fromHex(r.nonce) };
}

export type AcceptResult = VerifyResult & { item?: OutboxItem };

/** Verifies a scanned payment fully offline and, if valid, queues it for settlement. */
export async function acceptPayment(u: string, merchantIdHex: string, qrText: string): Promise<AcceptResult> {
  const scanned = parseQr(qrText);
  if (scanned.kind !== "bundle") return { ok: false, code: "request_mismatch" };
  const { bundle } = scanned;
  const network = await getNetwork();
  const open = await getOpenRequest(u);
  const outbox = await getOutbox(u);
  const allowanceHex = toHex(bundle.cert.allowanceId);
  const seen: SeenPayment[] = outbox
    .filter((i) => i.role === "merchant" && i.allowanceId === allowanceHex)
    .map((i) => ({ id: i.id, payment: decodeBundle(fromBase64Url(i.bundle)).payment }));
  const usedNonces = new Set(outbox.filter((i) => i.role === "merchant").map((i) => i.nonce));
  const revoked = new Set(network?.revocations.map((r) => r.allowanceId) ?? []);
  const keys = new Map(network?.issuerKeys.map((k) => [k.kid, k.publicKey]) ?? []);

  const res = await verifyBundle(bundle, {
    issuerKey: async (kid) => {
      const hex = keys.get(kid);
      return hex ? importPublicKey(fromHex(hex)) : undefined;
    },
    isRevoked: (id) => revoked.has(id),
    merchantId: fromHex(merchantIdHex),
    request: open ? parseStoredRequest(open) : undefined,
    seen,
    isNonceUsed: (n) => usedNonces.has(n),
  });
  if (!res.ok) return res;
  const item: OutboxItem = {
    id: res.id,
    role: "merchant",
    bundle: toBase64Url(encodeBundle(bundle)),
    allowanceId: allowanceHex,
    seq: bundle.payment.seq,
    nonce: toHex(bundle.payment.nonce),
    amount: bundle.payment.amount,
    currency: bundle.cert.currency,
    fromCredit: res.creditDrawn,
    counterparty: "",
    createdAt: Date.now(),
    status: "pending",
  };
  await putOutbox(u, item);
  await cancelRequest(u);
  return { ...res, item };
}

export { parseQr };
