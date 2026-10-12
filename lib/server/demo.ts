import "server-only";
/**
 * Pitch demo: gives the signed-in trader three weeks of offline sales so her
 * Business card and credit score have something to show. Everything goes
 * through the real protocol: real vaults, signed payments, settlement.
 * Sandbox partner only.
 */
import { randomUUID } from "node:crypto";
import { createRequest, encodeBundle, exportPublicKey, generateKeyPair, initWalletState, signPayment } from "@payvault/protocol";
import { issueForUser, ServiceError } from "./allowances";
import { merchantStats, refreshCreditProfile } from "./credit";
import type { Sql } from "./db";
import { type AppUser, createUser, enableMerchant, partnerById, registerDevice, submitKyc, userById } from "./identity";
import { sandboxTopUp } from "./money";
import { maxFunded, packFor } from "./policy";
import { ingestBundles } from "./settlement";

const NAMES = ["Ngozi", "Aminata", "Bola", "Fatou", "Chidi", "Kofi"];
const DAYS = 21;
const SHARES = [0.04, 0.07, 0.1, 0.15, 0.2, 0.12]; // of the per-payment limit

export async function seedDemoTrader(sql: Sql, userId: string): Promise<{ sales: number; tradingDays: number }> {
  let trader = (await userById(sql, userId))!;
  const partner = await partnerById(sql, trader.partner_id);
  if (partner?.kind !== "sandbox") throw new ServiceError("forbidden", "Demo data is for the sandbox only", 403);
  if ((await merchantStats(sql, trader)).tradingDays >= 5) {
    throw new ServiceError("already_seeded", "This business already has sales history", 409);
  }

  const pack = packFor(trader.country);
  const unit = 10 ** pack.currency.minorUnits;
  const funded = Math.min(pack.offlineLimits.perTransaction, maxFunded(pack, "tier1"));
  const today = Math.floor(Date.now() / 86_400_000) * 86_400;

  const customers: AppUser[] = await sql.begin(async (tx) => {
    if (!trader.merchant_id) await enableMerchant(tx, trader.id, trader.display_name);
    if (trader.kyc_tier === "tier0") await submitKyc(tx, trader.id, pack.kyc.idSystems[0], "DEMO-000001");
    const out: AppUser[] = [];
    for (const name of NAMES) {
      const id = randomUUID();
      out.push(await createUser(tx, { id, email: `${name.toLowerCase()}.${id.slice(0, 8)}@demo.payvault`, displayName: name, country: pack.code, locale: trader.locale }));
      await submitKyc(tx, id, pack.kyc.idSystems[0], "DEMO-" + id.slice(0, 8));
      await sandboxTopUp(tx, id, funded * 4);
    }
    return out;
  });
  trader = (await userById(sql, trader.id))!;

  // One vault per trading day, issued that morning; 2–4 sales through the day. Every 7th day off.
  const bundles: Uint8Array[] = [];
  for (let d = DAYS; d >= 1; d--) {
    if (d % 7 === 0) continue;
    const customer = customers[d % customers.length];
    const issuedAt = today - d * 86_400 + 7 * 3600;
    const key = await generateKeyPair();
    let state = await sql.begin(async (tx) => {
      const device = await registerDevice(tx, customer.id, await exportPublicKey(key.publicKey), "demo");
      return initWalletState(await issueForUser(tx, { userId: customer.id, deviceId: device.id, funded, credit: 0, issuedAt }));
    });
    for (let k = 0; k < 2 + (d % 3); k++) {
      const amount = Math.max(unit, Math.round((funded * SHARES[(d + k) % SHARES.length]) / unit) * unit);
      const req = createRequest(trader.merchant_id!, amount, trader.currency, trader.merchant_name ?? trader.display_name);
      const signed = await signPayment(key.privateKey, state, req, issuedAt + 3600 * (1 + 2 * k));
      state = signed.state;
      bundles.push(encodeBundle({ cert: state.cert, payment: signed.payment }));
    }
  }

  const results = await ingestBundles(sql, { kind: "user", userId: trader.id }, bundles);
  await sql.begin((tx) => refreshCreditProfile(tx, trader));
  return {
    sales: results.filter((r) => r.status === "settled").length,
    tradingDays: (await merchantStats(sql, trader)).tradingDays,
  };
}
