import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Falls back safely if NEXT_PUBLIC_SITE_URL is unset, empty, or missing its
// scheme (e.g. left blank in a deployment's env vars) — `new URL()` throws
// on any of those, and this runs at module load, so it would otherwise take
// the whole app down instead of just leaving metadataBase wrong.
function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      // fall through to the default below
    }
  }
  return new URL("http://localhost:3000");
}

// Title/description are locale-aware — see [locale]/layout.tsx's
// generateMetadata, which Next.js merges with this.
export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolved from the request context next-intl's plugin sets up — works
  // even here, above the [locale] route segment.
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      style={{ colorScheme: "dark" }}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-950 font-sans text-neutral-100">
        {children}
      </body>
    </html>
  );
}
