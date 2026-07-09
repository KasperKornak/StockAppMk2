import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPln } from "@/lib/format";
import { computeAveragePrice, computeQuantityAtDate, type HoldingTransaction } from "@/lib/holdings/position";
import { createClient } from "@/lib/supabase/server";
import { getDomicileRates } from "@/lib/tax/domicile-rates";
import { resolveSuggestedWithholdingRate } from "@/lib/tax/withholding-rate";
import { AddTransactionForm } from "./add-transaction-form";
import { deleteTransaction } from "./actions";
import { DeleteHoldingButton } from "./delete-holding-button";
import { HoldingSettingsForm } from "./holding-settings-form";

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-neutral-950 p-5">
      <div className="text-xs font-medium tracking-wider text-neutral-500 uppercase">{label}</div>
      <div
        className={`mt-2 text-xl font-semibold tabular-nums ${
          accent ? "text-emerald-400" : "text-neutral-50"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default async function HoldingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: holding } = await supabase
    .from("holdings")
    .select("id, ticker, domicile, w8ben_confirmed, withholding_rate_override")
    .eq("id", id)
    .maybeSingle();

  if (!holding) {
    notFound();
  }

  const { data: transactionRows } = await supabase
    .from("holding_transactions")
    .select("id, transaction_type, quantity, price, transaction_date")
    .eq("holding_id", id)
    .order("transaction_date", { ascending: false });

  const transactions: HoldingTransaction[] = (transactionRows ?? []).map((t) => ({
    transactionType: t.transaction_type,
    quantity: t.quantity,
    price: t.price,
    transactionDate: t.transaction_date,
  }));

  const quantity = computeQuantityAtDate(transactions);
  const avgPrice = computeAveragePrice(transactions);

  const { data: priceRow } = await supabase
    .from("security_prices")
    .select("price")
    .eq("ticker", holding.ticker)
    .maybeSingle();
  const marketValue = priceRow ? priceRow.price * quantity : null;

  const domicileRates = await getDomicileRates(supabase, holding.domicile);
  const suggestedRate = resolveSuggestedWithholdingRate({
    domicile: holding.domicile,
    w8benConfirmed: holding.w8ben_confirmed,
    domicileDefaultRate: domicileRates.defaultWithholdingRate,
  });

  const yearStart = `${new Date().getFullYear()}-01-01`;
  const { data: ytdEvents } = await supabase
    .from("dividend_events")
    .select("gross_amount_pln")
    .eq("holding_id", id)
    .eq("status", "confirmed")
    .gte("pay_date", yearStart);
  const ytdReceivedPln = (ytdEvents ?? []).reduce((sum, e) => sum + (e.gross_amount_pln ?? 0), 0);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-300">
        ← Holdings
      </Link>

      <div className="mt-3 mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-50">{holding.ticker}</h1>
          <p className="text-sm text-neutral-500">{holding.domicile ?? "Domicile unknown"}</p>
        </div>
        <DeleteHoldingButton holdingId={holding.id} ticker={holding.ticker} />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-800/80 sm:grid-cols-4">
        <Stat label="Quantity" value={String(quantity)} />
        <Stat label="Avg price" value={avgPrice !== null ? avgPrice.toFixed(2) : "—"} />
        <Stat label="Market value" value={marketValue !== null ? marketValue.toFixed(2) : "—"} />
        <Stat label="YTD received" value={formatPln(ytdReceivedPln)} accent />
      </div>

      <HoldingSettingsForm
        holdingId={holding.id}
        w8benConfirmed={holding.w8ben_confirmed}
        withholdingRateOverride={holding.withholding_rate_override}
        suggestedRate={suggestedRate}
      />

      <div className="mt-8 mb-4">
        <h2 className="text-sm font-medium text-neutral-300">Transactions</h2>
      </div>

      {transactionRows && transactionRows.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-neutral-800">
          <div className="grid grid-cols-5 gap-4 border-b border-neutral-800 bg-neutral-900/60 px-5 py-2.5 text-xs font-medium tracking-wider text-neutral-500 uppercase">
            <span>Date</span>
            <span>Type</span>
            <span className="text-right">Quantity</span>
            <span className="text-right">Price</span>
            <span />
          </div>
          {transactionRows.map((t, i) => (
            <div
              key={t.id}
              className={`grid grid-cols-5 items-center gap-4 px-5 py-3 ${
                i !== transactionRows.length - 1 ? "border-b border-neutral-800/70" : ""
              }`}
            >
              <span className="text-sm text-neutral-300">{t.transaction_date}</span>
              <span
                className={`text-sm font-medium ${
                  t.transaction_type === "buy" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {t.transaction_type}
              </span>
              <span className="text-right text-sm tabular-nums text-neutral-400">
                {t.quantity}
              </span>
              <span className="text-right text-sm tabular-nums text-neutral-400">
                {t.price !== null ? t.price.toFixed(2) : "—"}
              </span>
              <form action={deleteTransaction} className="text-right">
                <input type="hidden" name="transactionId" value={t.id} />
                <input type="hidden" name="holdingId" value={holding.id} />
                <button
                  type="submit"
                  className="rounded-md border border-neutral-700 px-2.5 py-1 text-xs font-medium text-neutral-300 transition-colors hover:border-red-900 hover:bg-red-950/50 hover:text-red-400"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-neutral-800 px-5 py-8 text-center text-neutral-400">
          No transactions yet.
        </p>
      )}

      <AddTransactionForm holdingId={holding.id} />
    </div>
  );
}
