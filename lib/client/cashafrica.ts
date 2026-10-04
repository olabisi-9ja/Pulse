"use client";
import { api } from "./api";

export type CashTapCard = {
  id: string;
  maskedPan: string;
  expiry: string;
  status: "active" | "suspended" | "revoked";
  createdAt: string;
};

export type TapPaymentResult = {
  ok: boolean;
  ref: string;
  status: string;
  amount: number;
  currency: string;
  transport: "nfc" | "cashscan" | "tap_simulate";
  settledAt: string;
};

/**
 * Checks if the browser natively supports Web NFC (e.g. Android Chrome).
 */
export function isWebNfcSupported(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

/**
 * Fetches or provisions the user's CashAfrica CashTap virtual PAN.
 */
export async function getCashTapCard(): Promise<CashTapCard> {
  const res = await api<{ pan: CashTapCard }>("/api/app/cashafrica/pan");
  return res.pan;
}

/**
 * Executes a tap-to-pay transaction via the PayVault + CashAfrica API.
 */
export async function executeTapPay(params: {
  merchantId: string;
  amount: number;
  transport?: "nfc" | "cashscan" | "tap_simulate";
  metadata?: Record<string, unknown>;
}): Promise<TapPaymentResult> {
  return api<TapPaymentResult>("/api/app/cashafrica/pay", {
    merchantId: params.merchantId,
    amount: params.amount,
    transport: params.transport ?? (isWebNfcSupported() ? "nfc" : "tap_simulate"),
    metadata: params.metadata,
  });
}
