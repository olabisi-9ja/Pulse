import { randomBytes, toBase64Url } from "@payvault/protocol";
import { z } from "zod";
import { ServiceError } from "@/lib/server/allowances";
import { requirePartnerRole } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { isPrivateHost } from "@/lib/server/events";
import { handle, json, parseBody } from "@/lib/server/http";

const Body = z.object({
  partnerId: z.guid(),
  url: z.string().trim().max(500).optional(),
  generateSecret: z.boolean().optional(),
});

function validUrl(raw: string): string {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new ServiceError("invalid_request", "url: enter a full URL such as https://example.com/webhooks");
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  if (u.protocol !== "https:" && !(u.protocol === "http:" && local && process.env.NODE_ENV !== "production")) {
    throw new ServiceError("invalid_request", "url: must use https");
  }
  if (process.env.NODE_ENV === "production" && isPrivateHost(u.hostname)) {
    throw new ServiceError("invalid_request", "url: must be publicly reachable");
  }
  return u.toString();
}

/** Sets the webhook URL and/or rotates the signing secret (returned once, stored as-is for HMAC signing). */
export const POST = handle(async (req: Request) => {
  const b = await parseBody(req, Body);
  await requirePartnerRole(b.partnerId, ["owner", "admin"]);
  const s = db();
  if (b.url !== undefined) {
    const url = b.url === "" ? null : validUrl(b.url);
    await s`update pv.partners set webhook_url = ${url} where id = ${b.partnerId}`;
  }
  if (b.generateSecret) {
    const secret = `whsec_${toBase64Url(randomBytes(24))}`;
    await s`update pv.partners set webhook_secret = ${secret} where id = ${b.partnerId}`;
    return json({ ok: true, reveal: secret });
  }
  return json({ ok: true });
});
