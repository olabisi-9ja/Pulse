import { describe, expect, it } from "vitest";
import { type CreditHistory, creditDecision, packFor } from "./policy";

const base: CreditHistory = {
  tier: "tier1", accountAgeDays: 0, loansRepaidOnTime: 0, loansRepaidLate: 0, openOverdue: 0, fraudCases: 0, settledPayments: 0, tradingDays: 0,
};

describe("credit decision", () => {
  it("counts a trader's takings days as credit history, capped at 20 points", () => {
    const pack = packFor("NG");
    const none = creditDecision(pack, base);
    const trader = creditDecision(pack, { ...base, tradingDays: 25 });
    expect(trader.score - none.score).toBe(20);
    expect(trader.limit).toBeGreaterThan(none.limit);
    expect(creditDecision(pack, { ...base, tier: "tier0", tradingDays: 30 }).limit).toBe(0); // still needs KYC
  });
});
