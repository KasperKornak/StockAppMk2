import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "@/i18n/navigation";

export function SiteHeader() {
  const t = useTranslations("SiteHeader");

  return (
    <header className="relative z-10 border-b border-neutral-900">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-neutral-950">
            D
          </div>
          <span className="font-medium tracking-tight text-neutral-100">
            Dividend Tax Tracker
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
