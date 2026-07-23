"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/[locale]/dashboard/notifications-actions";
import { useRouter } from "@/i18n/navigation";
import { formatPln } from "@/lib/format";
import type { NotificationItem } from "@/lib/notifications/types";

export function NotificationBell({ notifications }: { notifications: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("Notifications");
  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    router.refresh();
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("title")}
        className="relative flex h-8 w-8 items-center justify-center text-neutral-300 transition-colors hover:text-emerald-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-neutral-950">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Click-outside-to-close backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          {/* Anchored to the viewport on mobile (inset-x-4) — anchoring to
              this button's own tiny wrapper via `right-0` let the fixed
              320px-wide panel grow left past the screen edge whenever the
              bell wasn't the rightmost element in the header row. From sm
              up there's enough room for the original button-relative
              positioning. */}
          <div className="fixed inset-x-4 top-16 z-20 rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-80">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
              <span className="text-sm font-medium text-neutral-300">{t("title")}</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  {t("markAllRead")}
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-neutral-500">{t("empty")}</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`block w-full border-b border-neutral-800/70 px-4 py-3 text-left last:border-b-0 hover:bg-neutral-900/40 ${
                      n.read ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-100">
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                      {n.ticker}
                      <span className="text-xs font-normal text-neutral-500">
                        {n.type === "upcoming" ? t("upcoming") : t("confirmed")}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-400">
                      {n.grossAmountForeign !== null &&
                        `${n.grossAmountForeign.toFixed(2)} ${n.foreignCurrency ?? ""}`}
                      {n.amountToSetAsidePln !== null && (
                        <> · {t("setAside", { amount: formatPln(n.amountToSetAsidePln) })}</>
                      )}
                    </div>
                    {n.payDate && (
                      <div className="mt-0.5 text-xs text-neutral-500">
                        {t("payDate", { date: n.payDate })}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
