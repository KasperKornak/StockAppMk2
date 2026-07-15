"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { formatPln, formatRate } from "@/lib/format";

export interface DividendCalculationDetails {
  grossAmountForeign: number | null;
  foreignCurrency: string | null;
  foreignWithholdingRate: number | null;
  treatyCreditRate: number | null;
  nbpFxRate: number | null;
  grossAmountPln: number | null;
  polishTaxDuePln: number | null;
  foreignTaxCreditPln: number | null;
  amountToSetAsidePln: number | null;
}

export function DividendCalculationInfo({ details }: { details: DividendCalculationDetails }) {
  const t = useTranslations("DividendCalculationInfo");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const isFinalized =
    details.nbpFxRate !== null &&
    details.grossAmountPln !== null &&
    details.polishTaxDuePln !== null &&
    details.foreignTaxCreditPln !== null &&
    details.amountToSetAsidePln !== null;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={t("title")}
        title={t("title")}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-700 text-xs text-neutral-400 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
      >
        i
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
        className="fixed top-1/2 left-1/2 m-0 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-800 bg-neutral-950 p-0 text-neutral-100 backdrop:bg-black/60"
      >
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-300">{t("title")}</h3>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={t("close")}
              className="text-neutral-500 hover:text-neutral-300"
            >
              ✕
            </button>
          </div>

          {!isFinalized ? (
            <p className="text-sm text-neutral-400">{t("notFinalized")}</p>
          ) : (
            <ol className="space-y-2 text-sm text-neutral-300">
              <li>
                {t("grossDividend", {
                  amount: details.grossAmountForeign!.toFixed(2),
                  currency: details.foreignCurrency ?? "",
                })}
              </li>
              <li>{t("nbpRate", { rate: details.nbpFxRate! })}</li>
              <li className="border-t border-neutral-800 pt-2">
                {t("grossPlnLabel")}{" "}
                <span className="font-medium">{formatPln(details.grossAmountPln!)}</span>
              </li>
              <li>{t("polishTaxDue", { amount: formatPln(details.polishTaxDuePln!) })}</li>
              <li>
                {t("foreignWithholding", {
                  rate:
                    details.foreignWithholdingRate !== null
                      ? formatRate(details.foreignWithholdingRate)
                      : "—",
                })}
                {details.treatyCreditRate !== null &&
                  t("treatyNote", { rate: formatRate(details.treatyCreditRate) })}
              </li>
              <li>{t("creditable", { amount: formatPln(details.foreignTaxCreditPln!) })}</li>
              <li className="border-t border-neutral-800 pt-2 font-medium text-emerald-400">
                {t("setAsideFormula", { amount: formatPln(details.amountToSetAsidePln!) })}
              </li>
            </ol>
          )}
        </div>
      </dialog>
    </>
  );
}
