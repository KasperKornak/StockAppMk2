import Link from "next/link";
import { formatPln } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  DIVIDEND_EVENTS_SELECT,
  DividendEventsTable,
  type DividendEventRow,
} from "../dividend-events-table";

function tickerOf(row: DividendEventRow): string {
  if (!row.holdings) return "—";
  return Array.isArray(row.holdings) ? (row.holdings[0]?.ticker ?? "—") : row.holdings.ticker;
}

// Read-only, year-scoped view of dividend_events. No separate "snapshot"
// mechanism needed — a confirmed event's numbers are already frozen at
// calculation time (see calculateDividendTax / sync.ts), so this is just a
// filtered browse, not a copy of the data.
export default async function TaxYearsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const supabase = await createClient();
  const currentYear = new Date().getFullYear();
  const selectedYear = year ? Number(year) : currentYear;

  const { data: allConfirmedDates } = await supabase
    .from("dividend_events")
    .select("pay_date")
    .eq("status", "confirmed")
    .not("pay_date", "is", null);
  const years = [
    ...new Set((allConfirmedDates ?? []).map((e) => Number(e.pay_date!.slice(0, 4)))),
  ].sort((a, b) => b - a);
  if (!years.includes(currentYear)) {
    years.unshift(currentYear);
  }

  const yearStart = `${selectedYear}-01-01`;
  const yearEnd = `${selectedYear}-12-31`;
  const { data: events } = await supabase
    .from("dividend_events")
    .select(DIVIDEND_EVENTS_SELECT)
    .eq("status", "confirmed")
    .gte("pay_date", yearStart)
    .lte("pay_date", yearEnd)
    .order("pay_date", { ascending: false });
  const typedEvents = (events ?? []) as unknown as DividendEventRow[];

  const totalReceivedPln = typedEvents.reduce((sum, e) => sum + (e.gross_amount_pln ?? 0), 0);
  const totalSetAsidePln = typedEvents.reduce(
    (sum, e) => sum + (e.amount_to_set_aside_pln ?? 0),
    0,
  );

  const byTicker = new Map<string, { receivedPln: number; setAsidePln: number; count: number }>();
  for (const event of typedEvents) {
    const ticker = tickerOf(event);
    const entry = byTicker.get(ticker) ?? { receivedPln: 0, setAsidePln: 0, count: 0 };
    entry.receivedPln += event.gross_amount_pln ?? 0;
    entry.setAsidePln += event.amount_to_set_aside_pln ?? 0;
    entry.count += 1;
    byTicker.set(ticker, entry);
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="mb-5 text-sm font-medium text-neutral-300">Tax years</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        {years.map((y) => (
          <Link
            key={y}
            href={`/dashboard/tax-years?year=${y}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              y === selectedYear
                ? "bg-emerald-500 text-neutral-950"
                : "border border-neutral-700 text-neutral-300 hover:border-emerald-500/50 hover:text-emerald-400"
            }`}
          >
            {y}
          </Link>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-800/80">
        <div className="bg-neutral-950 p-6">
          <div className="text-xs font-medium tracking-wider text-neutral-500 uppercase">
            Received in {selectedYear}
          </div>
          <div className="mt-2.5 text-3xl font-semibold tracking-tight tabular-nums text-neutral-50">
            {formatPln(totalReceivedPln)}
          </div>
        </div>
        <div className="bg-neutral-950 p-6">
          <div className="text-xs font-medium tracking-wider text-emerald-400/80 uppercase">
            Set aside for {selectedYear}
          </div>
          <div className="mt-2.5 text-3xl font-semibold tracking-tight tabular-nums text-emerald-400">
            {formatPln(totalSetAsidePln)}
          </div>
        </div>
      </div>

      {byTicker.size > 0 && (
        <>
          <h2 className="mb-4 text-sm font-medium text-neutral-300">By holding</h2>
          <div className="mb-8 overflow-hidden rounded-xl border border-neutral-800">
            <div className="grid grid-cols-4 gap-4 border-b border-neutral-800 bg-neutral-900/60 px-5 py-2.5 text-xs font-medium tracking-wider text-neutral-500 uppercase">
              <span>Ticker</span>
              <span className="text-right">Payouts</span>
              <span className="text-right">Received</span>
              <span className="text-right">Set aside</span>
            </div>
            {[...byTicker.entries()].map(([ticker, totals], i, arr) => (
              <div
                key={ticker}
                className={`grid grid-cols-4 items-center gap-4 px-5 py-3 ${
                  i !== arr.length - 1 ? "border-b border-neutral-800/70" : ""
                }`}
              >
                <span className="font-medium text-neutral-100">{ticker}</span>
                <span className="text-right text-sm tabular-nums text-neutral-400">
                  {totals.count}
                </span>
                <span className="text-right text-sm tabular-nums text-neutral-400">
                  {formatPln(totals.receivedPln)}
                </span>
                <span className="text-right text-sm font-medium tabular-nums text-neutral-100">
                  {formatPln(totals.setAsidePln)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="mb-4 text-sm font-medium text-neutral-300">
        All confirmed payouts in {selectedYear}
      </h2>
      <DividendEventsTable
        events={typedEvents}
        emptyMessage={`No confirmed dividend payouts in ${selectedYear}.`}
      />
    </div>
  );
}
