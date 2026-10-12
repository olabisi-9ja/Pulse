import "server-only";
/** Texts traders when offline sales to their sticker or phone settle (basic-phone confirmation). */
import { formatMinor } from "@payvault/countries";
import type { Sql } from "./db";
import { sendSms } from "./sms";

export async function notifySettled(sql: Sql, paymentIdsHex: string[]): Promise<void> {
  const rows = await sql<{ phone: string; locale: string; currency: string; total: number; n: number }[]>`
    select u.phone, u.locale, a.currency, sum(p.amount)::bigint as total, count(*)::int as n
    from pv.payments p
    join pv.allowances a on a.id = p.allowance_id
    join pv.users u on u.id = p.merchant_user_id
    where p.id in ${sql(paymentIdsHex.map((h) => Buffer.from(h, "hex")))} and u.phone is not null
    group by u.phone, u.locale, a.currency`;
  for (const r of rows) {
    const amount = formatMinor(Number(r.total), r.currency, "en");
    await sendSms(
      r.phone,
      r.locale === "fr"
        ? `PayVault : ${r.n} vente(s) hors ligne confirmée(s), ${amount}.`
        : `PayVault: ${r.n} offline sale(s) confirmed, ${amount}.`,
    );
  }
}
