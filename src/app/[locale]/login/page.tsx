"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Link, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// FR-AUTH-003/004: email/password + OAuth login.
export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    // /auth/callback sits outside locale routing (its redirect URI is
    // registered verbatim with Google/Supabase) — pass the locale through
    // `next` explicitly so OAuth sign-in doesn't drop the user's language.
    const next = locale === routing.defaultLocale ? "/dashboard" : `/${locale}/dashboard`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-24">
        <h1 className="text-2xl font-semibold text-neutral-50">{t("title")}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            aria-label={t("emailPlaceholder")}
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none"
          />
          <input
            type="password"
            required
            aria-label={t("passwordPlaceholder")}
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none"
          />
          {turnstileSiteKey && (
            <div className="flex flex-col gap-1.5">
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                language={locale}
                onVerify={setCaptchaToken}
              />
              {!captchaToken && <p className="text-xs text-neutral-500">{t("captchaHint")}</p>}
            </div>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={Boolean(turnstileSiteKey) && !captchaToken}
            className="h-11 rounded-full bg-emerald-500 font-medium text-neutral-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {t("submit")}
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className="h-11 rounded-full border border-neutral-700 font-medium text-neutral-100 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
        >
          {t("google")}
        </button>
        <p className="text-sm text-neutral-400">
          {t("noAccount")}{" "}
          <Link href="/signup" className="text-emerald-400 underline hover:text-emerald-300">
            {t("signUpLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
