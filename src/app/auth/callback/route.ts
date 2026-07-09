import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth (and email-link) callback: Supabase redirects here with a `code`
// that must be exchanged for a session server-side before landing on any
// page — a Server Component like /dashboard renders (and checks auth)
// before client-side JS ever sees the code in the URL, so redirecting
// straight to /dashboard from signInWithOAuth always bounces back to /login.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
