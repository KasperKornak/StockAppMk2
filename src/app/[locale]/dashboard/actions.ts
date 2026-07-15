"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { massiveProvider } from "@/lib/market-data/massive-provider";
import { createClient } from "@/lib/supabase/server";

export interface AddHoldingState {
  error?: string;
  unsupportedTicker?: string;
  success?: boolean;
}

// FR-HOLD-001/002/003/006: validates the ticker against Massive, resolves
// domicile, and stores the holding. The suggested withholding rate itself
// isn't persisted — it's computed on read (see resolveSuggestedWithholdingRate)
// so it stays correct if the exchange->domicile map or W-8BEN status changes.
export async function addHolding(
  _prevState: AddHoldingState,
  formData: FormData,
): Promise<AddHoldingState> {
  const t = await getTranslations("AddHoldingErrors");
  const ticker = String(formData.get("ticker") ?? "")
    .trim()
    .toUpperCase();
  const quantity = Number(formData.get("quantity"));
  const priceRaw = formData.get("price");
  const price = priceRaw ? Number(priceRaw) : null;
  const acquiredDate = String(formData.get("acquiredDate") ?? "").trim();
  const w8benConfirmed = formData.get("w8benConfirmed") === "on";

  if (!ticker || !Number.isFinite(quantity) || quantity <= 0) {
    return { error: t("tickerAndQuantityRequired") };
  }
  if (!acquiredDate) {
    return { error: t("dateRequired") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: t("loginRequired") };
  }

  const overview = await massiveProvider.getTickerOverview(ticker);
  if (!overview) {
    return { error: t("unsupportedTicker"), unsupportedTicker: ticker };
  }

  const { data: holding, error: insertError } = await supabase
    .from("holdings")
    .insert({
      user_id: user.id,
      ticker: overview.ticker,
      domicile: overview.domicileCountry,
      currency: overview.currency,
      w8ben_confirmed: w8benConfirmed,
    })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: t("duplicateTicker") };
    }
    return { error: t("insertFailed") };
  }

  // Dividends are calculated from shares held as of each dividend's date
  // (see holding_transactions) — this first transaction is what makes any
  // dividend before it correctly compute to 0 shares and get skipped.
  const { error: transactionError } = await supabase.from("holding_transactions").insert({
    holding_id: holding.id,
    transaction_type: "buy",
    quantity,
    price,
    transaction_date: acquiredDate,
  });
  if (transactionError) {
    return { error: t("transactionFailed") };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// FR-HOLD-007: request support for a ticker Massive doesn't cover.
export async function requestTickerSupport(formData: FormData): Promise<void> {
  const ticker = String(formData.get("ticker") ?? "")
    .trim()
    .toUpperCase();
  if (!ticker) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("ticker_support_requests").insert({ user_id: user.id, ticker });
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect({ href: "/", locale: await getLocale() });
}
