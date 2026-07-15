import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pl"],
  defaultLocale: "en",
  // Default locale has no URL prefix (/dashboard), the other locale does
  // (/pl/dashboard) — keeps every existing bookmark/link/e2e test working.
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
