export interface TickerOverview {
  ticker: string;
  name: string;
  currency: string | null;
  primaryExchange: string | null;
  /** Best-guess tax domicile — see exchange-domicile.ts for the ADR caveat. */
  domicileCountry: string | null;
}

export interface DividendRecord {
  /** Massive's own record id — used as the dedup key in security_dividends. */
  massiveId: string;
  ticker: string;
  cashAmount: number;
  currency: string;
  declarationDate: string | null;
  exDividendDate: string | null;
  recordDate: string | null;
  payDate: string | null;
  frequency: number | null;
  distributionType: string | null;
}

export interface PriceQuote {
  ticker: string;
  price: number;
  /** Date the price is as-of — end-of-day on the free Basic plan, not real-time. */
  asOfDate: string;
}

export interface MarketDataProvider {
  /** Returns null if the ticker is unsupported (FR-HOLD-003). */
  getTickerOverview(ticker: string): Promise<TickerOverview | null>;
  getDividendHistory(ticker: string): Promise<DividendRecord[]>;
  getLatestPrice(ticker: string): Promise<PriceQuote | null>;
}
