import type { SupabaseClient } from "@supabase/supabase-js";
import { getCachedNbpRate } from "@/lib/fx/nbp-rate-cache";
import { computeQuantityAtDate, type HoldingTransaction } from "@/lib/holdings/position";
import { massiveProvider } from "@/lib/market-data/massive-provider";
import { createNotificationIfEnabled } from "@/lib/notifications/create";
import { calculateDividendTax } from "@/lib/tax/calculate";
import { getDomicileRates } from "@/lib/tax/domicile-rates";
import { resolveSuggestedWithholdingRate, resolveTreatyCreditRate } from "@/lib/tax/withholding-rate";
import { determineEventStatus } from "./status";

interface HoldingRow {
  id: string;
  user_id: string;
  ticker: string;
  domicile: string | null;
  w8ben_confirmed: boolean;
  withholding_rate_override: number | null;
}

interface SecurityDividendRow {
  id: string;
  ticker: string;
  cash_amount: number;
  currency: string;
  ex_dividend_date: string | null;
  pay_date: string | null;
}

export interface SyncResult {
  tickersSynced: number;
  eventsCreated: number;
  eventsQualified: number;
  eventsFinalized: number;
  /** Dividends whose date predates any transaction on the holding — correctly excluded. */
  eventsSkippedNoShares: number;
}

/**
 * In-memory layer on top of the persistent nbp_rates cache (getCachedNbpRate)
 * — avoids redundant DB round-trips for the same (currency, date) pair
 * within a single sync run, on top of avoiding redundant NBP calls across runs.
 */
function createRateCache(supabase: SupabaseClient) {
  const cache = new Map<string, Promise<number | null>>();
  return (currency: string, date: string): Promise<number | null> => {
    const key = `${currency}|${date}`;
    let pending = cache.get(key);
    if (!pending) {
      pending = getCachedNbpRate(supabase, currency, date);
      cache.set(key, pending);
    }
    return pending;
  };
}

/**
 * Daily sync (FR-DIV-001/003): finalizes matured events first (see ordering
 * note below), then fetches dividend history once per unique ticker across
 * all users (not per holding — see Market Data Provider NFR), caches it,
 * and fans out new dividend events to each holding on that ticker using
 * shares held as of each dividend's ex-dividend date (not today's
 * quantity — see holding_transactions).
 */
export async function syncDividendsForAllHoldings(
  supabase: SupabaseClient,
): Promise<SyncResult> {
  const lookupNbpRate = createRateCache(supabase);

  // Run these two FIRST, before the rate-limited per-ticker Massive loop
  // below. Neither calls Massive at all — qualify is a pure date check,
  // and finalize only needs NBP (fast, permanently cached) — so already-
  // pending events actually get confirmed even if the ticker loop times
  // out and never completes. This ordering matters: a real production
  // incident showed the ticker loop alone exceeding Vercel's maxDuration
  // once enough unique tickers accumulated, which meant finalize (running
  // last, after the loop) never got a turn on ANY invocation — dividends
  // sat at "qualified" forever despite the pay date having long passed.
  const eventsQualified = await qualifyMaturedExDates(supabase);
  const eventsFinalized = await finalizeMaturedDividendEvents(supabase, lookupNbpRate);

  // Removed (soft-deleted, see 0014_holdings_soft_delete.sql) holdings are
  // excluded — no point spending Massive rate-limit budget generating new
  // upcoming dividends for a position the user took off their dashboard.
  // Their existing dividend_events history is untouched either way.
  const { data: holdings, error: holdingsError } = await supabase
    .from("holdings")
    .select("id, user_id, ticker, domicile, w8ben_confirmed, withholding_rate_override")
    .is("deleted_at", null);
  if (holdingsError) throw holdingsError;

  const typedHoldings = (holdings ?? []) as HoldingRow[];
  const holdingIds = typedHoldings.map((h) => h.id);

  const { data: transactions, error: transactionsError } = holdingIds.length
    ? await supabase
        .from("holding_transactions")
        .select("holding_id, transaction_type, quantity, price, transaction_date")
        .in("holding_id", holdingIds)
    : { data: [] as never[], error: null };
  if (transactionsError) throw transactionsError;

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

  const tickers = [...new Set(typedHoldings.map((h) => h.ticker))];

  let eventsCreated = 0;
  let eventsSkippedNoShares = 0;

  for (const ticker of tickers) {
    const records = await massiveProvider.getDividendHistory(ticker);

    if (records.length) {
      const { data: upserted, error: upsertError } = await supabase
        .from("security_dividends")
        .upsert(
          records.map((r) => ({
            ticker: r.ticker,
            massive_id: r.massiveId,
            cash_amount: r.cashAmount,
            currency: r.currency,
            declaration_date: r.declarationDate,
            ex_dividend_date: r.exDividendDate,
            record_date: r.recordDate,
            pay_date: r.payDate,
            frequency: r.frequency,
            distribution_type: r.distributionType,
          })),
          { onConflict: "massive_id" },
        )
        .select("id, ticker, cash_amount, currency, ex_dividend_date, pay_date");
      if (upsertError) throw upsertError;

      const securityDividends = (upserted ?? []) as SecurityDividendRow[];
      const holdingsForTicker = typedHoldings.filter((h) => h.ticker === ticker);

      for (const holding of holdingsForTicker) {
        const result = await createNewDividendEvents(
          supabase,
          holding,
          transactionsByHolding.get(holding.id) ?? [],
          securityDividends,
          lookupNbpRate,
        );
        eventsCreated += result.created;
        eventsSkippedNoShares += result.skippedNoShares;
      }
    }

    // Latest price cache for market value display (F4) — best-effort; a
    // failure here shouldn't abort the dividend sync for this ticker.
    try {
      const quote = await massiveProvider.getLatestPrice(ticker);
      if (quote) {
        const { error: priceError } = await supabase
          .from("security_prices")
          .upsert(
            { ticker: quote.ticker, price: quote.price, as_of_date: quote.asOfDate },
            { onConflict: "ticker" },
          );
        if (priceError) throw priceError;
      }
    } catch {
      // Non-critical — market value is a display nicety, not tax-critical.
    }
  }

  return {
    tickersSynced: tickers.length,
    eventsCreated,
    eventsQualified,
    eventsFinalized,
    eventsSkippedNoShares,
  };
}

async function createNewDividendEvents(
  supabase: SupabaseClient,
  holding: HoldingRow,
  transactions: HoldingTransaction[],
  securityDividends: SecurityDividendRow[],
  lookupNbpRate: (currency: string, date: string) => Promise<number | null>,
): Promise<{ created: number; skippedNoShares: number }> {
  const { data: existingLinks } = await supabase
    .from("dividend_events")
    .select("security_dividend_id")
    .eq("holding_id", holding.id);
  const linkedIds = new Set(
    (existingLinks ?? []).map((row: { security_dividend_id: string }) => row.security_dividend_id),
  );

  const domicileRates = await getDomicileRates(supabase, holding.domicile);
  const effectiveRate = resolveEffectiveRate(holding, domicileRates.defaultWithholdingRate);
  const treatyCreditRate =
    resolveTreatyCreditRate(holding.domicile, domicileRates.treatyCreditRate) ?? undefined;

  const today = new Date().toISOString().slice(0, 10);
  let created = 0;
  let skippedNoShares = 0;

  for (const dividend of securityDividends) {
    if (linkedIds.has(dividend.id)) continue;

    // Shares held as of the ex-dividend date determine eligibility — a
    // dividend from before your first transaction correctly nets to 0 and
    // is skipped, rather than being charged against today's quantity.
    const asOfDate = dividend.ex_dividend_date ?? dividend.pay_date ?? today;
    const quantityAtDate = computeQuantityAtDate(transactions, asOfDate);
    if (quantityAtDate <= 0) {
      skippedNoShares++;
      continue;
    }

    const status = determineEventStatus(dividend.ex_dividend_date, dividend.pay_date);
    const grossAmountForeign = dividend.cash_amount * quantityAtDate;

    // FX rate and PLN tax figures are only knowable once the dividend is
    // confirmed — NBP publishes no rate for a date that hasn't happened yet,
    // so upcoming/qualified events show the foreign-currency gross only.
    const fxRate =
      status === "confirmed" && dividend.pay_date && effectiveRate !== null
        ? await lookupNbpRate(dividend.currency, dividend.pay_date)
        : null;

    const taxFields =
      fxRate !== null && effectiveRate !== null
        ? calculateDividendTax({
            grossAmountForeign,
            foreignWithholdingRate: effectiveRate,
            nbpFxRate: fxRate,
            treatyCreditRate,
          })
        : null;

    const { data: insertedEvent, error: insertError } = await supabase
      .from("dividend_events")
      .insert({
        holding_id: holding.id,
        security_dividend_id: dividend.id,
        status,
        ex_dividend_date: dividend.ex_dividend_date,
        pay_date: dividend.pay_date,
        gross_amount_foreign: grossAmountForeign,
        foreign_currency: dividend.currency,
        foreign_withholding_rate: effectiveRate,
        treaty_credit_rate: treatyCreditRate ?? null,
        nbp_fx_rate: fxRate,
        gross_amount_pln: taxFields?.grossAmountPln ?? null,
        polish_tax_due_pln: taxFields?.polishTaxDuePln ?? null,
        foreign_tax_credit_pln: taxFields?.foreignTaxCreditPln ?? null,
        amount_to_set_aside_pln: taxFields?.amountToSetAsidePln ?? null,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;
    created++;

    // FR-DIV-002/004: notify for whichever state the event was created in.
    // Notifications only distinguish upcoming-vs-confirmed — "qualified" is
    // a display nuance on the same not-yet-paid notification.
    await createNotificationIfEnabled(
      supabase,
      holding.user_id,
      insertedEvent.id,
      status === "confirmed" ? "confirmed" : "upcoming",
    );
  }

  return { created, skippedNoShares };
}

async function finalizeMaturedDividendEvents(
  supabase: SupabaseClient,
  lookupNbpRate: (currency: string, date: string) => Promise<number | null>,
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: matured, error } = await supabase
    .from("dividend_events")
    .select(
      "id, holding_id, pay_date, gross_amount_foreign, foreign_currency, foreign_withholding_rate, treaty_credit_rate",
    )
    .in("status", ["upcoming", "qualified"])
    .lte("pay_date", today);
  if (error) throw error;

  const holdingIds = [...new Set((matured ?? []).map((e) => e.holding_id))];
  const { data: holdingUsers } = holdingIds.length
    ? await supabase.from("holdings").select("id, user_id").in("id", holdingIds)
    : { data: [] as { id: string; user_id: string }[] };
  const userIdByHolding = new Map((holdingUsers ?? []).map((h) => [h.id, h.user_id]));

  let finalized = 0;

  for (const event of matured ?? []) {
    if (!event.pay_date || event.foreign_withholding_rate === null) continue;

    const fxRate = await lookupNbpRate(event.foreign_currency, event.pay_date);
    if (fxRate === null) continue; // NBP hasn't published it yet — retry next run

    const taxFields = calculateDividendTax({
      grossAmountForeign: event.gross_amount_foreign,
      foreignWithholdingRate: event.foreign_withholding_rate,
      nbpFxRate: fxRate,
      treatyCreditRate: event.treaty_credit_rate ?? undefined,
    });

    const { error: updateError } = await supabase
      .from("dividend_events")
      .update({
        status: "confirmed",
        nbp_fx_rate: fxRate,
        gross_amount_pln: taxFields.grossAmountPln,
        polish_tax_due_pln: taxFields.polishTaxDuePln,
        foreign_tax_credit_pln: taxFields.foreignTaxCreditPln,
        amount_to_set_aside_pln: taxFields.amountToSetAsidePln,
      })
      .eq("id", event.id);
    if (updateError) throw updateError;
    finalized++;

    const userId = userIdByHolding.get(event.holding_id);
    if (userId) {
      await createNotificationIfEnabled(supabase, userId, event.id, "confirmed");
    }
  }

  return finalized;
}

/**
 * FR-DIV-001: events created before their ex-dividend date start out
 * "upcoming"; once that date passes (shares are locked in) they flip to
 * "qualified" while still awaiting payment. No FX/tax fields change here —
 * those only get filled in once finalizeMaturedDividendEvents confirms.
 */
async function qualifyMaturedExDates(supabase: SupabaseClient): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("dividend_events")
    .update({ status: "qualified" })
    .eq("status", "upcoming")
    .lte("ex_dividend_date", today)
    .select("id");
  if (error) throw error;
  return (data ?? []).length;
}

function resolveEffectiveRate(
  holding: HoldingRow,
  domicileDefaultRate: number | null,
): number | null {
  if (holding.withholding_rate_override !== null) {
    return holding.withholding_rate_override;
  }
  return resolveSuggestedWithholdingRate({
    domicile: holding.domicile,
    w8benConfirmed: holding.w8ben_confirmed,
    domicileDefaultRate,
  });
}
