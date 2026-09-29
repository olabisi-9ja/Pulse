/** Device signing key and app PIN. Both are per user and stay on this device. */
import { exportPublicKey, generateKeyPair, toHex } from "@payvault/protocol";
import { kv } from "./kv";

export type DeviceKey = { keyPair: CryptoKeyPair; publicKeyHex: string; deviceId?: string };

export async function getDeviceKey(userId: string): Promise<DeviceKey> {
  const k = `device:${userId}`;
  const existing = await kv.get<DeviceKey>(k);
  if (existing) return existing;
  // Non-extractable: the private key can sign but can never be read out.
  const keyPair = await generateKeyPair(false);
  const created = { keyPair, publicKeyHex: toHex(await exportPublicKey(keyPair.publicKey)) };
  await kv.set(k, created);
  return created;
}

export async function saveDeviceId(userId: string, deviceId: string): Promise<void> {
  const d = await getDeviceKey(userId);
  await kv.set(`device:${userId}`, { ...d, deviceId });
}

type PinRecord = { salt: Uint8Array; hash: Uint8Array; iterations: number; failures: number; lockedUntil: number };

const ITERATIONS = 150_000;

async function derive(pin: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    base,
    256,
  );
  return new Uint8Array(bits);
}

export const isValidPin = (pin: string) => /^\d{4,6}$/.test(pin);

export async function hasPin(userId: string): Promise<boolean> {
  return !!(await kv.get<PinRecord>(`pin:${userId}`));
}

export async function setPin(userId: string, pin: string): Promise<void> {
  if (!isValidPin(pin)) throw new Error("PIN must be 4 to 6 digits");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  await kv.set(`pin:${userId}`, { salt, hash: await derive(pin, salt, ITERATIONS), iterations: ITERATIONS, failures: 0, lockedUntil: 0 });
}

export type PinCheck = { ok: true } | { ok: false; reason: "wrong" | "locked"; retryAt?: number; attemptsLeft?: number };

/** Verifies the PIN; five wrong tries lock signing for five minutes. */
export async function checkPin(userId: string, pin: string): Promise<PinCheck> {
  const rec = await kv.get<PinRecord>(`pin:${userId}`);
  if (!rec) return { ok: false, reason: "wrong" };
  if (rec.lockedUntil > Date.now()) return { ok: false, reason: "locked", retryAt: rec.lockedUntil };
  const hash = await derive(pin, rec.salt, rec.iterations);
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash[i] ^ rec.hash[i];
  if (diff === 0) {
    if (rec.failures) await kv.set(`pin:${userId}`, { ...rec, failures: 0 });
    return { ok: true };
  }
  const failures = rec.failures + 1;
  const lockedUntil = failures >= 5 ? Date.now() + 5 * 60_000 : 0;
  await kv.set(`pin:${userId}`, { ...rec, failures: lockedUntil ? 0 : failures, lockedUntil });
  return lockedUntil
    ? { ok: false, reason: "locked", retryAt: lockedUntil }
    : { ok: false, reason: "wrong", attemptsLeft: 5 - failures };
}
