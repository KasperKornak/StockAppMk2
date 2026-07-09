/**
 * FR-DIV-001/003: a dividend event is "confirmed" once its pay date has
 * passed (exact NBP rate for that date becomes available), otherwise it's
 * still "upcoming" (estimated).
 */
export function determineEventStatus(
  payDate: string | null,
  today: Date = new Date(),
): "upcoming" | "confirmed" {
  if (!payDate) {
    return "upcoming";
  }
  const todayIso = today.toISOString().slice(0, 10);
  return payDate <= todayIso ? "confirmed" : "upcoming";
}
