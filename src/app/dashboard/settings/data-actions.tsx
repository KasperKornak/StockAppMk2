"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMyAccount, exportMyData } from "./actions";

export function DataActions() {
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
    const confirmed = window.confirm(
      "Delete your account? This permanently removes your holdings, transactions, dividend history, and login. This cannot be undone.",
    );
    if (!confirmed) return;

    setDeleting(true);
    await deleteMyAccount();
    router.push("/");
  }

  return (
    <div className="mt-6 rounded-xl border border-neutral-800 p-5">
      <h2 className="text-sm font-medium text-neutral-300">Your data</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Export everything we store about you, or permanently delete your account.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="h-10 rounded-full border border-neutral-700 px-5 font-medium text-neutral-100 transition-colors hover:border-emerald-500/50 hover:text-emerald-400 disabled:opacity-50"
        >
          {exporting ? "Exporting…" : "Export my data"}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="h-10 rounded-full border border-red-900 px-5 font-medium text-red-400 transition-colors hover:bg-red-950/50 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete my account"}
        </button>
      </div>
    </div>
  );
}
