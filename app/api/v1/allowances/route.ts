import { encodeAllowance, fromHex, toBase64Url, toHex } from "@payvault/protocol";
import { z } from "zod";
import { issueForPartner, ServiceError } from "@/lib/server/allowances";
import { db } from "@/lib/server/db";
import { handle, json, parseBody, zHex } from "@/lib/server/http";
import { requirePartner } from "@/lib/server/partner-api";

const Body = z.object({
  devicePublicKey: zHex(33),
  country: z.string().length(2),
  funded: z.number().int().min(0),
  credit: z.number().int().min(0).default(0),
  externalRef: z.string().min(1).max(100),
  ttlHours: z.number().int().positive().max(720).optional(),
});

/** Issue an allowance for a device whose funds (and credit) the partner holds in its own ledger. */
export const POST = handle(async (req: Request) => {
  const partner = await requirePartner(req);
  if (partner.ledger_mode !== "external") {
    throw new ServiceError("hosted_partner", "Hosted-ledger partners issue vaults through the app", 409);
  }
  const body = await parseBody(req, Body);
  const cert = await db().begin((tx) =>
    issueForPartner(tx, partner, { ...body, devicePublicKey: fromHex(body.devicePublicKey) }),
  );
  return json(
    {
      id: toHex(cert.allowanceId),
      cert: toBase64Url(encodeAllowance(cert)),
      issuerKid: cert.issuerKid,
      currency: cert.currency,
      funded: cert.funded,
      credit: cert.credit,
      perTxLimit: cert.perTxLimit,
      expiresAt: new Date(cert.expiresAt * 1000).toISOString(),
    },
    { status: 201 },
  );
});
