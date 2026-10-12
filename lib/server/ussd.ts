import "server-only";
/**
 * USSD menu for basic phones (Africa's Talking format: `text` is every answer
 * so far joined by "*"; reply "CON …" to continue or "END …" to finish).
 * Needs signal, not data. Payments settle online on the ledger, and count as
 * the trader's trading days like offline sales do.
 */
import { formatMinor, SUPPORTED_CURRENCIES } from "@payvault/countries";
import { executeTapPayment, TapPaymentError } from "./cashafrica";
import type { Sql } from "./db";
import { checkUssdPin, merchantCode, userByMerchantCode, userByPhone } from "./identity";
import { balances } from "./money";
import { rateLimit } from "./ratelimit";
import { sendSms } from "./sms";

const minorUnitsOf = (currency: string) => SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.minorUnits ?? 2;
const fmt = (minor: number, currency: string) => formatMinor(minor, currency, "en");

export async function ussdReply(sql: Sql, phone: string, text: string): Promise<string> {
  const user = await userByPhone(sql, phone);
  const fr = user?.locale === "fr";
  const L = (en: string, frText: string) => (fr ? frText : en);
  if (!user) return "END " + "This number isn't linked to PayVault. Open the app > Profile to link it.";
  if (user.status !== "active") return "END " + L("Your account is frozen.", "Votre compte est gelé.");

  const [choice, ...rest] = text ? text.split("*") : [];
  if (!choice) {
    return (
      "CON PayVault\n" +
      L("1. Balance\n2. Pay a trader\n3. My takings\n4. My trader code", "1. Solde\n2. Payer un commerçant\n3. Mes ventes\n4. Mon code commerçant")
    );
  }

  if (choice === "1") {
    const b = await balances(sql, user);
    return "END " + L("Balance: ", "Solde : ") + fmt(b.wallet, user.currency);
  }

  if (choice === "3" || choice === "4") {
    if (!user.merchant_id) return "END " + L("Turn on merchant mode in the app first.", "Activez d'abord le mode commerçant dans l'app.");
    if (choice === "4") return "END " + L("Your trader code: ", "Votre code commerçant : ") + (await sql.begin((tx) => merchantCode(tx, user.id)));
    const b = await balances(sql, user);
    return "END " + L("Takings: ", "Ventes : ") + fmt(b.merchant, user.currency);
  }

  if (choice === "2") {
    const [code, amountText, pin] = rest;
    if (code === undefined) return "CON " + L("Enter the trader code", "Entrez le code du commerçant");
    const trader = /^[0-9]{8}$/.test(code) ? await userByMerchantCode(sql, code) : undefined;
    if (!trader) return "END " + L("No trader with that code.", "Aucun commerçant avec ce code.");
    if (amountText === undefined) return "CON " + L(`Pay ${trader.merchant_name}. Amount in ${user.currency}`, `Payer ${trader.merchant_name}. Montant en ${user.currency}`);
    const major = Number(amountText);
    if (!Number.isFinite(major) || major <= 0) return "END " + L("Invalid amount.", "Montant invalide.");
    const amount = Math.round(major * 10 ** minorUnitsOf(user.currency));
    if (pin === undefined) return "CON " + L(`Pay ${fmt(amount, user.currency)} to ${trader.merchant_name}? Enter PIN`, `Payer ${fmt(amount, user.currency)} à ${trader.merchant_name} ? Entrez le code PIN`);

    try {
      await rateLimit(`ussd-pin:${phone}`, 5, 900, sql); // 5 PIN tries per 15 min
    } catch {
      return "END " + L("Too many tries. Try again later.", "Trop d'essais. Réessayez plus tard.");
    }
    if (!checkUssdPin(user, pin)) return "END " + L("Wrong PIN.", "Code PIN incorrect.");
    try {
      const res = await sql.begin((tx) => executeTapPayment(tx, { payer: user, merchant: trader, amount, currency: user.currency, transport: "ussd" }));
      const paid = fmt(res.amount, res.currency);
      await sendSms(trader.phone, L(`PayVault: you received ${paid} from ${user.display_name}. Ref ${res.ref}`, `PayVault : vous avez reçu ${paid} de ${user.display_name}. Réf ${res.ref}`));
      return "END " + L(`Paid ${paid} to ${trader.merchant_name}. Ref ${res.ref}`, `${paid} payé à ${trader.merchant_name}. Réf ${res.ref}`);
    } catch (err) {
      if (err instanceof TapPaymentError) return "END " + (err.code === "insufficient_funds" ? L("Not enough money.", "Solde insuffisant.") : err.message);
      throw err;
    }
  }

  return "END " + L("Invalid choice.", "Choix invalide.");
}
