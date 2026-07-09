"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/dashboard/actions";
import { NotificationBell } from "@/components/notification-bell";
import type { NotificationItem } from "@/lib/notifications/types";

export function DashboardHeader({
  userEmail,
  notifications,
}: {
  userEmail: string;
  notifications: NotificationItem[];
}) {
  const pathname = usePathname();

  return (
    <header className="relative z-10 border-b border-neutral-900">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-neutral-950">
              D
            </div>
            <span className="font-medium tracking-tight text-neutral-100">
              Dividend Tax Tracker
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
              Holdings
            </Link>
            <Link
              href="/dashboard/tax-years"
              className={
                pathname === "/dashboard/tax-years"
                  ? "text-neutral-100"
                  : "text-neutral-500 transition-colors hover:text-neutral-300"
              }
            >
              Tax Years
            </Link>
            <Link
              href="/dashboard/settings"
              className={
                pathname === "/dashboard/settings"
                  ? "text-neutral-100"
                  : "text-neutral-500 transition-colors hover:text-neutral-300"
              }
            >
              Settings
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <NotificationBell notifications={notifications} />
          <span className="hidden max-w-[16ch] truncate text-neutral-500 sm:inline" title={userEmail}>
            {userEmail}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-neutral-700 px-3 py-1.5 text-neutral-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
