import { defineConfig } from "@playwright/test";

// KNOWN LIMITATION: every spec here logs in, and Cloudflare Turnstile is
// designed to block headless/automated browsers — so with a real
// NEXT_PUBLIC_TURNSTILE_SITE_KEY set, the login submit button never
// enables, and with it unset, Supabase's server-side captcha enforcement
// rejects the request outright ("captcha protection: request disallowed").
// There is no in-between. To run this suite locally, temporarily disable
// "Captcha protection" in Supabase Dashboard > Authentication, then
// re-enable it afterward. (Not an issue in CI — GitHub Actions only runs
// unit tests, not this e2e suite.)
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
