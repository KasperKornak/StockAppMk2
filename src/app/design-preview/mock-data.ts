// Static sample data for comparing visual design directions — not wired to
// Supabase. Delete this whole design-preview directory once a direction is
// chosen and applied to the real dashboard.

export interface MockHolding {
  ticker: string;
  name: string;
  domicile: string;
  quantity: number;
  avgPrice: number;
  currency: string;
  suggestedRate: number;
  ytdReceivedPln: number;
}

export const mockHoldings: MockHolding[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    domicile: "USA",
    quantity: 15,
    avgPrice: 172.3,
    currency: "USD",
    suggestedRate: 0.3,
    ytdReceivedPln: 61.4,
  },
  {
    ticker: "GSK",
    name: "GSK plc",
    domicile: "GBR",
    quantity: 40,
    avgPrice: 38.1,
    currency: "USD",
    suggestedRate: 0,
    ytdReceivedPln: 512.8,
  },
  {
    ticker: "PKO",
    name: "PKO Bank Polski",
    domicile: "POL",
    quantity: 100,
    avgPrice: 52.4,
    currency: "PLN",
    suggestedRate: 0.19,
    ytdReceivedPln: 1268.3,
  },
];

export const mockYtdSummary = {
  totalReceivedPln: 1842.5,
  totalSetAsidePln: 96.2,
};

export function formatPln(value: number): string {
  return `${value.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
