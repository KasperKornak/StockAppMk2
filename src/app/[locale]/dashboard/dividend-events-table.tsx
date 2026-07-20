import { useTranslations } from "next-intl";
import { formatPln } from "@/lib/format";
import { DividendCalculationInfo } from "./dividend-calculation-info";

const eventColumns = "0.6fr 0.7fr 0.8fr 0.9fr 0.9fr 0.9fr 0.9fr 0.3fr";

export interface DividendEventRow {
  id: string;
  status: "upcoming" | "qualified" | "confirmed";
  pay_date: string | null;
  gross_amount_foreign: number | null;
  foreign_currency: string | null;
  foreign_withholding_rate: number | null;
  treaty_credit_rate: number | null;
  nbp_fx_rate: number | null;
  gross_amount_pln: number | null;
  polish_tax_due_pln: number | null;
  foreign_tax_credit_pln: number | null;
  amount_to_set_aside_pln: number | null;
  holdings: { ticker: string } | { ticker: string }[] | null;
}

function tickerOf(row: DividendEventRow): string {
  if (!row.holdings) return "—";
  return Array.isArray(row.holdings) ? (row.holdings[0]?.ticker ?? "—") : row.holdings.ticker;
}

export function DividendEventsTable({
  events,
  emptyMessage,
}: {
  events: DividendEventRow[];
  emptyMessage: string;
}) {
  const t = useTranslations("DividendEventsTable");

  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-neutral-800 px-5 py-8 text-center text-neutral-400">
        {emptyMessage}
      </p>
    );
  }

  const rows = events.map((event) => {
    const afterTaxesForeign =
      event.gross_amount_foreign !== null && event.foreign_withholding_rate !== null
        ? event.gross_amount_foreign * (1 - event.foreign_withholding_rate)
        : null;
    const afterTaxesPln =
      afterTaxesForeign !== null && event.nbp_fx_rate !== null
        ? afterTaxesForeign * event.nbp_fx_rate
        : null;
    const statusLabel =
      event.status === "confirmed"
        ? t("statusConfirmed")
        : event.status === "qualified"
          ? t("statusQualified")
          : t("statusUpcoming");
    const statusClass =
      event.status === "confirmed"
        ? "bg-emerald-500/10 text-emerald-400"
        : event.status === "qualified"
          ? "bg-blue-500/10 text-blue-400"
          : "bg-neutral-800 text-neutral-400";

    return { event, afterTaxesForeign, afterTaxesPln, statusLabel, statusClass };
  });

  return (
    <div className="rounded-xl border border-neutral-800">
      {/* Mobile: stacked cards — the grid table below needs more width than
          any phone has, and forcing horizontal scroll there is worse UX
          than just re-laying-out the same data vertically. */}
      <div className="divide-y divide-neutral-800/70 sm:hidden">
        {rows.map(({ event, afterTaxesPln, statusLabel, statusClass }) => (
          <div key={event.id} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-100">{tickerOf(event)}</span>
              <span
                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
              >
                {statusLabel}
              </span>
            </div>
            <div className="mt-2 text-xs text-neutral-500">{event.pay_date ?? "—"}</div>
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <div className="text-xs text-neutral-500">{t("colGross")}</div>
                <div className="tabular-nums text-neutral-300">
                  {event.gross_amount_foreign !== null
                    ? `${event.gross_amount_foreign.toFixed(2)} ${event.foreign_currency ?? ""}`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">{t("colAfterTaxesPln")}</div>
                <div className="tabular-nums text-neutral-300">
                  {afterTaxesPln !== null ? formatPln(afterTaxesPln) : "—"}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-neutral-500">{t("colSetAside")}</div>
                <div className="font-medium tabular-nums text-neutral-100">
                  {event.amount_to_set_aside_pln !== null
                    ? formatPln(event.amount_to_set_aside_pln)
                    : "—"}
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <DividendCalculationInfo
                details={{
                  grossAmountForeign: event.gross_amount_foreign,
                  foreignCurrency: event.foreign_currency,
                  foreignWithholdingRate: event.foreign_withholding_rate,
                  treatyCreditRate: event.treaty_credit_rate,
                  nbpFxRate: event.nbp_fx_rate,
                  grossAmountPln: event.gross_amount_pln,
                  polishTaxDuePln: event.polish_tax_due_pln,
                  foreignTaxCreditPln: event.foreign_tax_credit_pln,
                  amountToSetAsidePln: event.amount_to_set_aside_pln,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/tablet: full grid table */}
      <div className="hidden overflow-x-auto sm:block">
        <div className="min-w-[820px]">
          <div
            className="grid gap-4 border-b border-neutral-800 bg-neutral-900/60 px-5 py-2.5 text-xs font-medium tracking-wider text-neutral-500 uppercase"
            style={{ gridTemplateColumns: eventColumns }}
          >
            <span>{t("colTicker")}</span>
            <span>{t("colStatus")}</span>
            <span>{t("colPayDate")}</span>
            <span className="text-right">{t("colGross")}</span>
            <span className="text-right">{t("colAfterTaxes")}</span>
            <span className="text-right">{t("colAfterTaxesPln")}</span>
            <span className="text-right">{t("colSetAside")}</span>
            <span />
          </div>
          {rows.map(({ event, afterTaxesForeign, afterTaxesPln, statusLabel, statusClass }, i) => (
            <div
              key={event.id}
              style={{ gridTemplateColumns: eventColumns }}
              className={`grid items-center gap-4 px-5 py-4 ${
                i !== rows.length - 1 ? "border-b border-neutral-800/70" : ""
              }`}
            >
              <span className="whitespace-nowrap font-medium text-neutral-100">
                {tickerOf(event)}
              </span>
              <span>
                <span
                  className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </span>
              <span className="whitespace-nowrap text-sm text-neutral-400">
                {event.pay_date ?? "—"}
              </span>
              <span className="whitespace-nowrap text-right text-sm tabular-nums text-neutral-400">
                {event.gross_amount_foreign !== null
                  ? `${event.gross_amount_foreign.toFixed(2)} ${event.foreign_currency ?? ""}`
                  : "—"}
              </span>
              <span className="whitespace-nowrap text-right text-sm tabular-nums text-neutral-400">
                {afterTaxesForeign !== null
                  ? `${afterTaxesForeign.toFixed(2)} ${event.foreign_currency ?? ""}`
                  : "—"}
              </span>
              <span className="whitespace-nowrap text-right text-sm tabular-nums text-neutral-400">
                {afterTaxesPln !== null ? formatPln(afterTaxesPln) : "—"}
              </span>
              <span className="whitespace-nowrap text-right text-sm font-medium tabular-nums text-neutral-100">
                {event.amount_to_set_aside_pln !== null
                  ? formatPln(event.amount_to_set_aside_pln)
                  : "—"}
              </span>
              <span className="flex justify-end">
                <DividendCalculationInfo
                  details={{
                    grossAmountForeign: event.gross_amount_foreign,
                    foreignCurrency: event.foreign_currency,
                    foreignWithholdingRate: event.foreign_withholding_rate,
                    treatyCreditRate: event.treaty_credit_rate,
                    nbpFxRate: event.nbp_fx_rate,
                    grossAmountPln: event.gross_amount_pln,
                    polishTaxDuePln: event.polish_tax_due_pln,
                    foreignTaxCreditPln: event.foreign_tax_credit_pln,
                    amountToSetAsidePln: event.amount_to_set_aside_pln,
                  }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const DIVIDEND_EVENTS_SELECT =
  "id, status, pay_date, gross_amount_foreign, foreign_currency, foreign_withholding_rate, treaty_credit_rate, nbp_fx_rate, gross_amount_pln, polish_tax_due_pln, foreign_tax_credit_pln, amount_to_set_aside_pln, holdings(ticker)";
