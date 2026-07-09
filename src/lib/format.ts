export function formatPln(value: number): string {
  return `${value.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
