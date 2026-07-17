import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations("SiteHeader");

  return (
    <header className="relative z-10 border-b border-neutral-900">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl leading-none" aria-hidden>
            💸
          </span>
          <span className="font-medium tracking-tight text-neutral-100">
            Dividend Tax Tracker
          </span>
          <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
            {t("beta")}
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/#how-it-works"
            className="hidden text-neutral-400 transition-colors hover:text-neutral-100 sm:block"
          >
            {t("howItWorks")}
          </Link>
          <Link href="/login" className="text-neutral-300 transition-colors hover:text-neutral-100">
            {t("login")}
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-emerald-500 px-4 py-2 font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            {t("signup")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
