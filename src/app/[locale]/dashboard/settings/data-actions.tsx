"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { deleteMyAccount, exportMyData } from "./actions";

export function DataActions() {
  const t = useTranslations("Settings");
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleExport() {
    setExporting(true);
    try {
      const json = await exportMyData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dividend-tax-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(t("deleteConfirm"));
    if (!confirmed) return;

    setDeleting(true);
    await deleteMyAccount();
    router.push("/");
  }

  return (
    <div className="mt-6 rounded-xl border border-neutral-800 p-5">
      <h2 className="text-sm font-medium text-neutral-300">{t("yourDataTitle")}</h2>
      <p className="mt-1 text-sm text-neutral-500">{t("yourDataDesc")}</p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="h-10 rounded-full border border-neutral-700 px-5 font-medium text-neutral-100 transition-colors hover:border-emerald-500/50 hover:text-emerald-400 disabled:opacity-50"
        >
          {exporting ? t("exporting") : t("exportButton")}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="h-10 rounded-full border border-red-900 px-5 font-medium text-red-400 transition-colors hover:bg-red-950/50 disabled:opacity-50"
        >
          {deleting ? t("deleting") : t("deleteButton")}
        </button>
      </div>
    </div>
  );
}
