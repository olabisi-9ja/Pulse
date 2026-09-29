import { describe, expect, it } from "vitest";
import { isPrivateHost } from "./events";

describe("isPrivateHost", () => {
  it("blocks loopback, private, link-local and internal hosts", () => {
    for (const h of ["localhost", "127.0.0.1", "10.1.2.3", "172.20.0.1", "192.168.1.1", "169.254.169.254", "[::1]", "fd00::1", "fe80::1", "metadata.google.internal", "printer.local"]) {
      expect(isPrivateHost(h), h).toBe(true);
    }
  });
  it("allows public hosts", () => {
    for (const h of ["example.com", "8.8.8.8", "172.32.0.1", "hooks.partner.ng"]) {
      expect(isPrivateHost(h), h).toBe(false);
    }
  });
});
