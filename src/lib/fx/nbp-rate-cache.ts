import type { SupabaseClient } from "@supabase/supabase-js";
import { getNbpRateBeforeDate } from "./nbp-client";

/**
 * Wraps getNbpRateBeforeDate with a persistent cache keyed by the exact
 * (currency, requested date) pair — the resolved "business day before" rate
 * for a given past date never changes, so this avoids re-hitting NBP for
 * the same lookup on every future sync run, across every user.
 */
export async function getCachedNbpRate(
  supabase: SupabaseClient,
  currency: string,
  date: string,
): Promise<number | null> {
  const { data: cached } = await supabase
    .from("nbp_rates")
    .select("mid_rate")
    .eq("currency", currency)
    .eq("rate_date", date)
    .maybeSingle();
  if (cached) {
    return cached.mid_rate;
  }

  const rate = await getNbpRateBeforeDate(currency, date);
  if (rate !== null) {
    await supabase
      .from("nbp_rates")
      .upsert({ currency, rate_date: date, mid_rate: rate }, { onConflict: "currency,rate_date" });
  }
  return rate;
}
