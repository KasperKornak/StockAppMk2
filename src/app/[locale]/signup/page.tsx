"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// FR-AUTH-001: registration creates an unverified account and sends a
// verification email (handled by Supabase Auth).
export default function SignupPage() {
  const locale = useLocale();
  const t = useTranslations("Signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Turnstile tokens are single-use — Cloudflare rejects a token that's
  // already been verified once. Bumping this key remounts the widget (fresh
  // token) after any failed attempt, so a retry doesn't resend the same
  // now-consumed token and hit "captcha protection: request disallowed".
  const [turnstileKey, setTurnstileKey] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });
    if (error) {
      setError(error.message);
      setCaptchaToken(null);
      setTurnstileKey((k) => k + 1);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col">
        <SiteHeader />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-3 px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold text-neutral-50">{t("checkEmailTitle")}</h1>
          <p className="text-neutral-400">{t("checkEmailBody", { email })}</p>
        </div>
      </div>
    );
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
            minLength={10}
            aria-label={t("passwordPlaceholder")}
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none"
          />
          {turnstileSiteKey && (
            <div className="flex flex-col gap-1.5">
              <TurnstileWidget
                key={turnstileKey}
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
        <p className="text-sm text-neutral-400">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-emerald-400 underline hover:text-emerald-300">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
