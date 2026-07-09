import { guessDomicileFromExchange } from "./exchange-domicile";
import { massiveGet } from "./massive-client";
import type { DividendRecord, MarketDataProvider, PriceQuote, TickerOverview } from "./types";

interface MassiveTickerOverviewResponse {
  results?: {
    ticker: string;
    name: string;
    currency_name?: string;
    primary_exchange?: string;
  };
}

interface MassivePreviousDayBarResponse {
  results?: Array<{
    c: number;
    t?: number;
  }>;
}

interface MassiveDividendsResponse {
  results?: Array<{
    id: string;
    ticker: string;
    cash_amount: number;
    currency: string;
    declaration_date?: string;
    ex_dividend_date?: string;
    record_date?: string;
    pay_date?: string;
    frequency?: number;
    distribution_type?: string;
  }>;
}

export const massiveProvider: MarketDataProvider = {
  async getTickerOverview(ticker: string): Promise<TickerOverview | null> {
    const data = await massiveGet<MassiveTickerOverviewResponse>(
      `/v3/reference/tickers/${encodeURIComponent(ticker)}`,
    );
    if (!data?.results) {
      return null;
    }

    const { results } = data;
    return {
      ticker: results.ticker,
      name: results.name,
      currency: results.currency_name?.toUpperCase() ?? null,
      primaryExchange: results.primary_exchange ?? null,
      domicileCountry: guessDomicileFromExchange(results.primary_exchange ?? null),
    };
  },

  async getDividendHistory(ticker: string): Promise<DividendRecord[]> {
    const data = await massiveGet<MassiveDividendsResponse>("/stocks/v1/dividends", {
      ticker,
      limit: "100",
      sort: "ex_dividend_date.desc",
    });

    return (data?.results ?? []).map((record) => ({
      massiveId: record.id,
      ticker: record.ticker,
      cashAmount: record.cash_amount,
      currency: record.currency,
      declarationDate: record.declaration_date ?? null,
      exDividendDate: record.ex_dividend_date ?? null,
      recordDate: record.record_date ?? null,
      payDate: record.pay_date ?? null,
      frequency: record.frequency ?? null,
      distributionType: record.distribution_type ?? null,
    }));
  },

  async getLatestPrice(ticker: string): Promise<PriceQuote | null> {
    // Previous-day-bar (end-of-day close) — the only price endpoint on the
    // free Basic plan; real-time/15-min-delayed snapshots require Starter+.
    const data = await massiveGet<MassivePreviousDayBarResponse>(
      `/v2/aggs/ticker/${encodeURIComponent(ticker)}/prev`,
    );
    const bar = data?.results?.[0];
    if (!bar) {
      return null;
    }

    return {
      ticker,
      price: bar.c,
      asOfDate: bar.t ? new Date(bar.t).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    };
  },
};
