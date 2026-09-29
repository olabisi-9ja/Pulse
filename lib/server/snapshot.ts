import "server-only";
/** Everything the wallet app caches for offline use, in one response. */
import { getCountryPack } from "@payvault/countries";
import { toBase64Url, toHex } from "@payvault/protocol";
import { allowancesForUser, revocationsSince } from "./allowances";
import { creditSummary, loansForUser } from "./credit";
import type { Db } from "./db";
import type { AppUser } from "./identity";
import { publicIssuerKeys } from "./issuer";
import { maxFunded } from "./policy";
import { activity, balances } from "./money";

export async function networkSnapshot(tx: Db, since = new Date(Date.now() - 30 * 86_400_000)) {
  return {
    issuerKeys: await publicIssuerKeys(tx),
    revocations: await revocationsSince(tx, since),
    serverTime: Math.floor(Date.now() / 1000),
  };
}

export async function appSnapshot(tx: Db, user: AppUser) {
  const pack = getCountryPack(user.country)!;
  const [bal, credit, allowances, loans, feed, network] = await Promise.all([
    balances(tx, user),
    creditSummary(tx, user),
    allowancesForUser(tx, user.id, 10),
    loansForUser(tx, user.id),
    activity(tx, user, 40),
    networkSnapshot(tx),
  ]);
  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      country: user.country,
      currency: user.currency,
      locale: user.locale,
      kycTier: user.kyc_tier,
      merchant: user.merchant_id ? { id: toHex(user.merchant_id), name: user.merchant_name ?? "" } : null,
    },
    limits: {
      maxFunded: maxFunded(pack, user.kyc_tier),
      perTransaction: pack.offlineLimits.perTransaction,
      ttlHours: pack.offlineLimits.allowanceTtlHours,
      idSystems: pack.kyc.idSystems,
      minorUnits: pack.currency.minorUnits,
    },
    balances: bal,
    credit: {
      limit: credit.credit_limit,
      available: credit.available,
      outstanding: credit.outstanding,
      score: credit.score,
      status: credit.status,
      reason: credit.reason,
    },
    allowances: allowances.map((a) => ({
      id: toHex(a.id),
      deviceId: a.device_id,
      cert: toBase64Url(a.cert),
      status: a.status,
      funded: a.funded,
      credit: a.credit,
      settledFunded: a.settled_funded,
      settledCredit: a.settled_credit,
      refunded: a.refunded,
      paymentsSettled: a.payments_count,
      expiresAt: a.expires_at.toISOString(),
      createdAt: a.created_at.toISOString(),
    })),
    loans: loans.map((l) => ({
      id: l.id,
      principal: l.principal,
      fee: l.fee,
      repaid: l.repaid,
      dueAt: l.due_at.toISOString(),
      status: l.status,
    })),
    activity: feed,
    network,
  };
}

export type AppSnapshot = Awaited<ReturnType<typeof appSnapshot>>;
