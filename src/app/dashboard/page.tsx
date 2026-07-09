import Link from "next/link";
import { computeAveragePrice, computeQuantityAtDate, type HoldingTransaction } from "@/lib/holdings/position";
import { formatPln, formatRate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { AddHoldingForm } from "./add-holding-form";
import { DIVIDEND_EVENTS_SELECT, DividendEventsTable, type DividendEventRow } from "./dividend-events-table";

const holdingColumns = "0.9fr 0.6fr 0.5fr 0.7fr 0.8fr 0.8fr 0.8fr";

// FR-DASH-001/002: portfolio overview + YTD tax set-aside summary, backed by
// the real dividend_events the daily sync job (FR-DIV-001/003) produces.
export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: holdings } = await supabase
    .from("holdings")
    .select("id, ticker, domicile, withholding_rate_override");
  const holdingIds = (holdings ?? []).map((h) => h.id);
  const tickers = [...new Set((holdings ?? []).map((h) => h.ticker))];

  const { data: transactions } = holdingIds.length
    ? await supabase
        .from("holding_transactions")
        .select("holding_id, transaction_type, quantity, price, transaction_date")
        .in("holding_id", holdingIds)
    : { data: [] };
  const transactionsByHolding = new Map<string, HoldingTransaction[]>();
  for (const row of transactions ?? []) {
    const list = transactionsByHolding.get(row.holding_id) ?? [];
    list.push({
      transactionType: row.transaction_type,
      quantity: row.quantity,
      price: row.price,
      transactionDate: row.transaction_date,
    });
    transactionsByHolding.set(row.holding_id, list);
  }

  const { data: prices } = tickers.length
    ? await supabase.from("security_prices").select("ticker, price").in("ticker", tickers)
    : { data: [] };
  const priceByTicker = new Map((prices ?? []).map((p) => [p.ticker, p.price]));

  const yearStart = `${new Date().getFullYear()}-01-01`;
  const { data: confirmedThisYear } = await supabase
    .from("dividend_events")
    .select("holding_id, gross_amount_pln, amount_to_set_aside_pln")
    .eq("status", "confirmed")
    .gte("pay_date", yearStart);

  const totalReceivedPln = (confirmedThisYear ?? []).reduce(
    (sum, e) => sum + (e.gross_amount_pln ?? 0),
    0,
  );
  const totalSetAsidePln = (confirmedThisYear ?? []).reduce(
    (sum, e) => sum + (e.amount_to_set_aside_pln ?? 0),
    0,
  );
  const receivedByHolding = new Map<string, number>();
  for (const event of confirmedThisYear ?? []) {
    receivedByHolding.set(
      event.holding_id,
      (receivedByHolding.get(event.holding_id) ?? 0) + (event.gross_amount_pln ?? 0),
    );
  }

  const { data: recentEvents } = await supabase
    .from("dividend_events")
    .select(DIVIDEND_EVENTS_SELECT)
    .order("pay_date", { ascending: false })
    .limit(8);
  const typedRecentEvents = (recentEvents ?? []) as unknown as DividendEventRow[];

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <div className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-800/80">
          <div className="bg-neutral-950 p-6">
            <div className="text-xs font-medium tracking-wider text-neutral-500 uppercase">
              Received this year
            </div>
            <div className="mt-2.5 text-3xl font-semibold tracking-tight tabular-nums text-neutral-50">
              {formatPln(totalReceivedPln)}
            </div>
          </div>
          <div className="bg-neutral-950 p-6">
            <div className="text-xs font-medium tracking-wider text-emerald-400/80 uppercase">
              Set aside for tax
            </div>
            <div className="mt-2.5 text-3xl font-semibold tracking-tight tabular-nums text-emerald-400">
              {formatPln(totalSetAsidePln)}
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-sm font-medium text-neutral-300">Holdings</h1>
        </div>

        {holdings && holdings.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-neutral-800">
            <div
              className="grid gap-4 border-b border-neutral-800 bg-neutral-900/60 px-5 py-2.5 text-xs font-medium tracking-wider text-neutral-500 uppercase"
              style={{ gridTemplateColumns: holdingColumns }}
            >
              <span>Ticker</span>
              <span>Domicile</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Avg price</span>
              <span className="text-right">Market value</span>
              <span className="text-right">YTD received</span>
              <span
                className="text-right"
                title="Overrides the suggested withholding rate we'd otherwise infer from the holding's domicile"
              >
                WHT override
              </span>
            </div>
            {holdings.map((holding, i) => {
              const holdingTransactions = transactionsByHolding.get(holding.id) ?? [];
              const quantity = computeQuantityAtDate(holdingTransactions);
              const avgPrice = computeAveragePrice(holdingTransactions);
              const price = priceByTicker.get(holding.ticker);
              const marketValue = price !== undefined ? price * quantity : null;
              const ytdReceivedPln = receivedByHolding.get(holding.id) ?? 0;

              return (
                <div
                  key={holding.id}
                  style={{ gridTemplateColumns: holdingColumns }}
                  className={`grid items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-900/40 ${
                    i !== holdings.length - 1 ? "border-b border-neutral-800/70" : ""
                  }`}
                >
                  <Link
                    href={`/dashboard/holdings/${holding.id}`}
                    className="font-medium text-neutral-100 hover:text-emerald-400"
                  >
                    {holding.ticker}
                  </Link>
                  <span className="text-sm text-neutral-400">{holding.domicile ?? "—"}</span>
                  <span className="text-right text-sm tabular-nums text-neutral-400">
                    {quantity}
                  </span>
                  <span className="text-right text-sm tabular-nums text-neutral-400">
                    {avgPrice !== null ? avgPrice.toFixed(2) : "—"}
                  </span>
                  <span className="text-right text-sm tabular-nums text-neutral-400">
                    {marketValue !== null ? marketValue.toFixed(2) : "—"}
                  </span>
                  <span className="text-right text-sm tabular-nums text-neutral-400">
                    {formatPln(ytdReceivedPln)}
                  </span>
                  <span className="text-right text-sm tabular-nums text-neutral-400">
                    {holding.withholding_rate_override !== null
                      ? formatRate(holding.withholding_rate_override)
                      : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-neutral-800 px-5 py-8 text-center text-neutral-400">
            No holdings yet. Add your first ticker to start tracking dividends.
          </p>
        )}

        <AddHoldingForm />

        <div className="mt-10 mb-5 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-300">Recent dividend activity</h2>
          <Link href="/dashboard/tax-years" className="text-sm text-emerald-400 hover:text-emerald-300">
            View by tax year →
          </Link>
        </div>

        <DividendEventsTable
          events={typedRecentEvents}
          emptyMessage="No dividend activity yet — this fills in once the daily sync finds payouts for your holdings."
        />
      </div>
    </div>
  );
}
