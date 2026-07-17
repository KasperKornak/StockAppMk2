"use client";

import { useTranslations } from "next-intl";
import { logout } from "@/app/[locale]/dashboard/actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NotificationBell } from "@/components/notification-bell";
import { Link, usePathname } from "@/i18n/navigation";
import type { NotificationItem } from "@/lib/notifications/types";

export function DashboardHeader({
  userEmail,
  notifications,
}: {
  userEmail: string;
  notifications: NotificationItem[];
}) {
  const pathname = usePathname();
  const t = useTranslations("DashboardNav");

  return (
    <header className="relative z-10 border-b border-neutral-900">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
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
          <nav className="flex items-center gap-5 text-sm">
            <Link
              href="/dashboard"
              className={
                pathname === "/dashboard"
                  ? "text-neutral-100"
                  : "text-neutral-500 transition-colors hover:text-neutral-300"
              }
            >
              {t("holdings")}
            </Link>
            <Link
              href="/dashboard/tax-years"
              className={
                pathname === "/dashboard/tax-years"
                  ? "text-neutral-100"
                  : "text-neutral-500 transition-colors hover:text-neutral-300"
              }
            >
              {t("taxYears")}
            </Link>
            <Link
              href="/dashboard/settings"
              className={
                pathname === "/dashboard/settings"
                  ? "text-neutral-100"
                  : "text-neutral-500 transition-colors hover:text-neutral-300"
              }
            >
              {t("settings")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <LanguageSwitcher />
          <NotificationBell notifications={notifications} />
          <span className="hidden max-w-[16ch] truncate text-neutral-500 sm:inline" title={userEmail}>
            {userEmail}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="text-neutral-400 transition-colors hover:text-emerald-400"
            >
              {t("logout")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
