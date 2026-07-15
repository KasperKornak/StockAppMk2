"use client";

import { useTranslations } from "next-intl";
import { formatRate } from "@/lib/format";
import { updateHoldingSettings } from "./actions";

export function HoldingSettingsForm({
  holdingId,
  w8benConfirmed,
  withholdingRateOverride,
  suggestedRate,
}: {
  holdingId: string;
  w8benConfirmed: boolean;
  withholdingRateOverride: number | null;
  suggestedRate: number | null;
}) {
  const t = useTranslations("HoldingSettingsForm");

  return (
    <div className="rounded-xl border border-neutral-800 p-5">
      <h2 className="text-sm font-medium text-neutral-300">{t("title")}</h2>
      <p className="mt-1 text-sm text-neutral-500">
        {t("suggestedRate", {
          rate: suggestedRate !== null ? formatRate(suggestedRate) : t("noDefaultRate"),
        })}
      </p>
      <form action={updateHoldingSettings} className="mt-4 flex flex-wrap items-end gap-4">
        <input type="hidden" name="holdingId" value={holdingId} />
        <label className="flex items-center gap-2 pb-2 text-sm text-neutral-400">
          <input name="w8benConfirmed" type="checkbox" defaultChecked={w8benConfirmed} />
          {t("w8benLabel")}
        </label>
        <div className="flex flex-col gap-1">
          <label htmlFor="withholdingRateOverride" className="text-sm text-neutral-500">
            {t("overrideLabel")}
          </label>
          <input
            id="withholdingRateOverride"
            name="withholdingRateOverride"
            type="text"
            inputMode="decimal"
            defaultValue={withholdingRateOverride !== null ? withholdingRateOverride * 100 : ""}
            className="w-48 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="h-10 rounded-full bg-emerald-500 px-5 font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
        >
          {t("save")}
        </button>
      </form>
    </div>
  );
}
