import { afterEach, expect, test, vi } from "vitest";
import { gatewayAllowed } from "./gateway";

const req = (key: string, ip: string) =>
  new Request(`https://x/api/ussd?key=${key}`, { method: "POST", headers: { "x-forwarded-for": `${ip}, 10.0.0.1` } });

afterEach(() => vi.unstubAllEnvs());

test("gateway needs the key and, when set, an allowlisted source IP", () => {
  vi.stubEnv("USSD_SECRET", "s3cret");
  expect(gatewayAllowed(req("s3cret", "1.2.3.4"))).toBe(true);
  expect(gatewayAllowed(req("wrong!", "1.2.3.4"))).toBe(false);
  vi.stubEnv("GATEWAY_IPS", "5.6.7.8, 1.2.3.4");
  expect(gatewayAllowed(req("s3cret", "1.2.3.4"))).toBe(true);
  expect(gatewayAllowed(req("s3cret", "9.9.9.9"))).toBe(false);
});
