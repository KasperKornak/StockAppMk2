"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";

export function StatusLegend() {
  const t = useTranslations("DividendEventsTable");
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={t("statusLegendTitle")}
        title={t("statusLegendTitle")}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-neutral-700 text-[10px] text-neutral-400 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
      >
        ?
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
        className="fixed top-1/2 left-1/2 m-0 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-800 bg-neutral-950 p-0 text-neutral-100 backdrop:bg-black/60"
      >
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-300">{t("statusLegendTitle")}</h3>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={t("close")}
              className="text-neutral-500 hover:text-neutral-300"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-3 text-sm">
            <li>
              <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-400">
                {t("statusUpcoming")}
              </span>
              <p className="mt-1 text-neutral-400">{t("statusUpcomingExplain")}</p>
            </li>
            <li>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                {t("statusQualified")}
              </span>
              <p className="mt-1 text-neutral-400">{t("statusQualifiedExplain")}</p>
            </li>
            <li>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                {t("statusConfirmed")}
              </span>
              <p className="mt-1 text-neutral-400">{t("statusPaidOutExplain")}</p>
            </li>
          </ul>
        </div>
      </dialog>
    </>
  );
}
