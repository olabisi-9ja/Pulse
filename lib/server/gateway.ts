import "server-only";
/**
 * Shared gate for telco callbacks (USSD, inbound SMS). Africa's Talking can't sign
 * requests or send headers, so the callback URL carries ?key=<USSD_SECRET>.
 * Without the secret, only development answers.
 */
import { timingSafeEqual } from "node:crypto";

export function gatewayAllowed(req: Request): boolean {
  const secret = process.env.USSD_SECRET;
  const key = new URL(req.url).searchParams.get("key") ?? "";
  if (!secret) return process.env.NODE_ENV !== "production";
  return key.length === secret.length && timingSafeEqual(Buffer.from(key), Buffer.from(secret));
}
