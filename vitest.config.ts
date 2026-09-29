import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "lib/**/*.test.ts"],
    environment: "node",
  },
});
