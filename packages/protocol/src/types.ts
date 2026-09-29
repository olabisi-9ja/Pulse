export const PROTOCOL_VERSION = 1;

export const MsgType = {
  Allowance: 0x01,
  Payment: 0x02,
  Request: 0x03,
  Bundle: 0x04,
  Close: 0x05,
} as const;

export const SIZES = {
  allowanceId: 16,
  merchantId: 8,
  nonce: 8,
  hash: 16,
  publicKey: 33,
  signature: 64,
  allowanceBody: 82,
  paymentBody: 64,
} as const;

/**
 * Partner-signed certificate that lets one device spend offline.
 *
 * Spending power = funded (value locked from the holder's balance) + credit
 * (an overdraft line the partner extends for offline "pay later"). Spending
 * draws the funded part first; anything above it becomes a credit drawdown
 * that is repaid after settlement.
 */
export type AllowanceCert = {
  allowanceId: Uint8Array;
  issuerKid: number;
  devicePub: Uint8Array;
  country: string;
  currency: string;
  funded: number;
  credit: number;
  perTxLimit: number;
  maxPayments: number;
  issuedAt: number;
  expiresAt: number;
  sig: Uint8Array;
};

export type AllowanceParams = Omit<AllowanceCert, "sig" | "allowanceId" | "issuedAt"> & {
  allowanceId?: Uint8Array;
  issuedAt?: number;
};

/** Payer-signed, hash-chained offline payment. */
export type Payment = {
  allowanceId: Uint8Array;
  seq: number;
  amount: number;
  cumulative: number;
  merchantId: Uint8Array;
  nonce: Uint8Array;
  time: number;
  prevHash: Uint8Array;
  sig: Uint8Array;
};

/** Merchant's payment request, shown as a QR for the payer to scan. */
export type PaymentRequest = {
  merchantId: Uint8Array;
  currency: string;
  amount: number;
  nonce: Uint8Array;
  time: number;
  name: string;
};

/** What the payer hands to the merchant: the allowance plus the payment. */
export type Bundle = { cert: AllowanceCert; payment: Payment };

/** Payer device state for one allowance. Must be persisted after every payment. */
export type WalletState = {
  cert: AllowanceCert;
  seq: number;
  cumulative: number;
  lastHash: Uint8Array;
};

export const capOf = (c: Pick<AllowanceCert, "funded" | "credit">) => c.funded + c.credit;

/**
 * Device-signed statement that it has stopped spending an allowance at
 * (seq, cumulative). Lets the holder cash out unspent value before expiry.
 */
export type CloseStatement = {
  allowanceId: Uint8Array;
  seq: number;
  cumulative: number;
  time: number;
  sig: Uint8Array;
};
