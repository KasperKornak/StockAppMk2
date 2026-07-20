import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pl"],
  // Polish-first: the app targets Polish tax residents. Default locale has
  // no URL prefix (/dashboard), English lives under /en (/en/dashboard).
  defaultLocale: "pl",
  localePrefix: "as-needed",
  // Without this, next-intl auto-detects locale from the browser's
  // Accept-Language header and silently redirects the bare domain to /en
  // for anyone with an English-configured browser — defeating the
  // Polish-first default for real visitors (and breaking test automation,
  // whose browsers report en-US). Explicit switching via the language
  // switcher still works; it just isn't guessed anymore.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
