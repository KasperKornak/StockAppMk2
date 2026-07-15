import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function localeFromPathname(pathname: string): string {
  const segment = pathname.split("/")[1];
  return (routing.locales as readonly string[]).includes(segment) ? segment : routing.defaultLocale;
}

function stripLocale(pathname: string, locale: string): string {
  if (pathname === `/${locale}`) return "/";
  if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  return pathname;
}

// Optimistic auth check only (FR-AUTH-002 email-verification gating is
// enforced in the dashboard layout via a DB read — proxy must stay fast,
// see Next.js proxy guide: not intended for slow data fetching).
//
// Composed with next-intl's locale routing (see i18n guide): the Supabase
// session refresh runs against `request` first so next-intl's middleware
// (called afterwards on the same, now-refreshed, request) and downstream
// Server Components both see up-to-date cookies; any Set-Cookie headers the
// refresh queued are then copied onto whatever response next-intl returns
// (a plain pass-through or a locale rewrite).
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const locale = localeFromPathname(request.nextUrl.pathname);
  const bare = stripLocale(request.nextUrl.pathname, locale);

  if (!user && bare.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  const response = handleI18nRouting(request);
  for (const cookie of supabaseResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }

  return response;
}

export const config = {
  // Runs for every page route except API routes, the OAuth callback (its
  // redirect URI is registered verbatim with Google/Supabase and must not
  // gain a locale prefix), the design-preview dev tool, and static assets.
  matcher: ["/((?!api|auth|design-preview|_next|.*\\..*).*)"],
};
