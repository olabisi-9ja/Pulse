import { describe, expect, it } from "vitest";
import { approx, convert, type RatesTable } from "./fx";

const rates: RatesTable = { perUsd: { USD: 1, EUR: 0.9, XOF: 0.9 * 655.957, NGN: 1500 }, asOf: 0, source: "live" };

describe("display conversion", () => {
  it("uses the fixed CFA peg against the euro", () => {
    expect(convert(655_957, "XOF", "EUR", rates)).toBeCloseTo(1000, 6);
  });

  it("respects minor units on both sides", () => {
    // 15,000.00 NGN (minor units) -> 10 USD
    expect(convert(1_500_000, "NGN", "USD", rates)).toBeCloseTo(10, 6);
  });

  it("shows nothing when off, same currency or rate missing", () => {
    expect(approx(100, "NGN", null, rates, "en")).toBeNull();
    expect(approx(100, "NGN", "NGN", rates, "en")).toBeNull();
    expect(approx(100, "NGN", "JPY", rates, "en")).toBeNull();
    expect(approx(1_500_000, "NGN", "USD", rates, "en")).toBe("≈ $10.00");
  });
});
