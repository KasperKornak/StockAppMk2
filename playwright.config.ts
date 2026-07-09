import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1, // tests share the rate-limited Massive API and the sync endpoint
  retries: 0,
  // Generous: a single test can chain an add-holding call with a full sync
  // run, each involving multiple rate-limited (5 req/min) Massive API calls.
  timeout: 90_000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
