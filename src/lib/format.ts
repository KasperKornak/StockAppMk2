export function formatPln(value: number): string {
  return `${value.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

/**
 * Parses a user-typed number that may use either a dot or a comma as the
 * decimal separator (Polish keyboards/locales default to comma). Only the
 * last separator found is treated as decimal — anything before it (e.g. a
 * thousands separator) is stripped.
 */
export function parseDecimal(raw: string): number {
  const trimmed = raw.trim();
  const lastSeparator = Math.max(trimmed.lastIndexOf(","), trimmed.lastIndexOf("."));
  if (lastSeparator === -1) {
    return Number(trimmed);
  }
  const wholePart = trimmed.slice(0, lastSeparator).replace(/[.,]/g, "");
  const fractionPart = trimmed.slice(lastSeparator + 1);
  return Number(`${wholePart}.${fractionPart}`);
}
