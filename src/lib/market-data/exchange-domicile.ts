/**
 * Massive's ticker overview endpoint has no company-domicile field (only a
 * US-style street address and a coarse `locale: "us" | "global"`). This maps
 * the primary listing exchange (MIC code) to a best-guess domicile country.
 *
 * Wrong for ADRs/foreign private issuers listed on a US exchange but
 * domiciled elsewhere (e.g. ASML, Shell) — FR-HOLD-005's user override is
 * the intended correction path for those. See spec's Market Data Provider NFR.
 */

const EXCHANGE_TO_COUNTRY: Record<string, string> = {
  XNAS: "USA",
  XNYS: "USA",
  ARCX: "USA",
  BATS: "USA",
  IEXG: "USA",
  XLON: "GBR",
  XETR: "DEU",
  XFRA: "DEU",
  XPAR: "FRA",
  XAMS: "NLD",
  XSWX: "CHE",
  XVTX: "CHE",
  XWAR: "POL",
  XWBO: "AUT",
  XMIL: "ITA",
  XMAD: "ESP",
  XSTO: "SWE",
  XCSE: "DNK",
  XHEL: "FIN",
  XOSL: "NOR",
  XTSE: "CAN",
  XASX: "AUS",
  XTKS: "JPN",
  XHKG: "HKG",
};

export function guessDomicileFromExchange(primaryExchange: string | null): string | null {
  if (!primaryExchange) {
    return null;
  }
  return EXCHANGE_TO_COUNTRY[primaryExchange] ?? null;
}
