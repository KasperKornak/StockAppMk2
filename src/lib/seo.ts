const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Polish has no URL prefix (default locale, see i18n/routing.ts), English
// lives under /en. Callers pass the page's own locale-independent path
// (e.g. "" for the homepage, "/privacy") — each page already knows this
// statically, no need to thread the request pathname through.
export function localeAlternates(path: string) {
  return {
    languages: {
      pl: `${siteUrl}${path}`,
      en: `${siteUrl}/en${path}`,
    },
  };
}
