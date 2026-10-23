import "server-only";
/**
 * Shared gate for telco callbacks (USSD, inbound SMS). Africa's Talking can't sign
 * requests or send headers, so the callback URL carries ?key=<USSD_SECRET>.
 * Without the secret, only development answers. GATEWAY_IPS (comma-separated)
 * additionally restricts callers to the provider's published source IPs; it relies
 * on the platform proxy setting x-forwarded-for, as Vercel does.
 */
import { timingSafeEqual } from "node:crypto";
import { clientIp } from "./ratelimit";

export function gatewayAllowed(req: Request): boolean {
  const ips = process.env.GATEWAY_IPS?.split(",").map((s) => s.trim()).filter(Boolean);
  if (ips?.length && !ips.includes(clientIp(req))) return false;
  const secret = process.env.USSD_SECRET;
  const key = new URL(req.url).searchParams.get("key") ?? "";
  if (!secret) return process.env.NODE_ENV !== "production";
  return key.length === secret.length && timingSafeEqual(Buffer.from(key), Buffer.from(secret));
}
