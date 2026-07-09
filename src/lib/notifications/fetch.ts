import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationItem } from "./types";

interface RawEvent {
  pay_date: string | null;
  gross_amount_foreign: number | null;
  foreign_currency: string | null;
  amount_to_set_aside_pln: number | null;
  holdings: { ticker: string } | { ticker: string }[] | null;
}

interface RawNotification {
  id: string;
  type: "upcoming" | "confirmed";
  read_at: string | null;
  dividend_events: RawEvent | RawEvent[] | null;
}

function firstOf<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/** Pure mapping from the raw nested-embed shape to a flat display item — exported for testing. */
export function normalizeNotificationRow(row: RawNotification): NotificationItem | null {
  const event = firstOf(row.dividend_events);
  if (!event) return null;
  const holding = firstOf(event.holdings);

  return {
    id: row.id,
    type: row.type,
    read: row.read_at !== null,
    ticker: holding?.ticker ?? "—",
    payDate: event.pay_date,
    grossAmountForeign: event.gross_amount_foreign,
    foreignCurrency: event.foreign_currency,
    amountToSetAsidePln: event.amount_to_set_aside_pln,
  };
}

export async function fetchRecentNotifications(
  supabase: SupabaseClient,
  limit = 20,
): Promise<NotificationItem[]> {
  const { data } = await supabase
    .from("notifications")
    .select(
      "id, type, read_at, created_at, dividend_events(pay_date, gross_amount_foreign, foreign_currency, amount_to_set_aside_pln, holdings(ticker))",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as unknown as RawNotification[];
  return rows
    .map(normalizeNotificationRow)
    .filter((item): item is NotificationItem => item !== null);
}
