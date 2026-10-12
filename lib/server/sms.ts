import "server-only";
/**
 * SMS through Africa's Talking when AT_USERNAME and AT_API_KEY are set (use
 * username "sandbox" for their free simulator); otherwise logged. Never throws.
 */
export async function sendSms(to: string | null, message: string): Promise<void> {
  if (!to) return;
  const username = process.env.AT_USERNAME;
  const apiKey = process.env.AT_API_KEY;
  if (!username || !apiKey) {
    console.log(`[sms] ${to}: ${message}`);
    return;
  }
  const host = username === "sandbox" ? "api.sandbox.africastalking.com" : "api.africastalking.com";
  try {
    const res = await fetch(`https://${host}/version1/messaging`, {
      method: "POST",
      headers: { apiKey, accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, to, message }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("sms failed", res.status);
  } catch (err) {
    console.error("sms failed", err);
  }
}
