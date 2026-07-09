/**
 * NBP (Narodowy Bank Polski) FX rates — free, no API key. See FR-TAX-001:
 * the rate to use is the average rate for the business day immediately
 * preceding the pay date, so we query a short window ending the day before
 * and take the most recent published entry (handles weekends/holidays).
 */

const NBP_BASE_URL = "https://api.nbp.pl/api/exchangerates/rates/a";
const LOOKBACK_WINDOW_DAYS = 10;

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface NbpRatesResponse {
  rates: Array<{ effectiveDate: string; mid: number }>;
}

export async function getNbpRateBeforeDate(
  currencyCode: string,
  dateIso: string,
): Promise<number | null> {
  if (currencyCode.toUpperCase() === "PLN") {
    return 1;
  }

  const end = new Date(`${dateIso}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - LOOKBACK_WINDOW_DAYS);

  const url = `${NBP_BASE_URL}/${currencyCode.toLowerCase()}/${formatDate(start)}/${formatDate(end)}/?format=json`;
  const response = await fetch(url);

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`NBP API error ${response.status} for ${currencyCode}`);
  }

  const data = (await response.json()) as NbpRatesResponse;
  if (!data.rates.length) {
    return null;
  }

  return data.rates[data.rates.length - 1].mid;
}
