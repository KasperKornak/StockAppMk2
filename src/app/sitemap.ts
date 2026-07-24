import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Public, indexable pages only — /dashboard and friends are disallowed in
// robots.ts and carry `robots: { index: false }` in their own metadata.
const paths = ["", "/help", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  // Polish has no URL prefix (default locale, see i18n/routing.ts),
  // English lives under /en — every entry lists both as hreflang
  // alternates of each other, which is what search engines use to avoid
  // treating the two languages as duplicate content.
  return paths.flatMap((path) => {
    const plUrl = `${siteUrl}${path}`;
    const enUrl = `${siteUrl}/en${path}`;
    const alternates = { languages: { pl: plUrl, en: enUrl } };

    return [
      {
        url: plUrl,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: path === "" ? 1 : 0.5,
        alternates,
      },
      {
        url: enUrl,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: path === "" ? 0.9 : 0.4,
        alternates,
      },
    ];
  });
}
