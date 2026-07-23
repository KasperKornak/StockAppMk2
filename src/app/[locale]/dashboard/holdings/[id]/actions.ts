"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { parseDecimal } from "@/lib/format";
import { computeQuantityAtDate, type HoldingTransaction } from "@/lib/holdings/position";
import { createClient } from "@/lib/supabase/server";

// FR-HOLD-005/006: lets the user override W-8BEN status and/or the
// effective withholding rate directly, rather than only at creation time.
export async function updateHoldingSettings(formData: FormData): Promise<void> {
  const holdingId = String(formData.get("holdingId") ?? "");
  if (!holdingId) return;

  const w8benConfirmed = formData.get("w8benConfirmed") === "on";
  const overrideRaw = formData.get("withholdingRateOverride");
  const overridePercent = overrideRaw ? parseDecimal(String(overrideRaw)) : null;
  const withholdingRateOverride =
    overridePercent !== null && Number.isFinite(overridePercent) ? overridePercent / 100 : null;

  const supabase = await createClient();
  await supabase
    .from("holdings")
    .update({ w8ben_confirmed: w8benConfirmed, withholding_rate_override: withholdingRateOverride })
    .eq("id", holdingId);

  revalidatePath(`/dashboard/holdings/${holdingId}`);
  revalidatePath("/dashboard");
}

export interface AddTransactionState {
  error?: string;
}

export async function addTransaction(
  _prevState: AddTransactionState,
  formData: FormData,
): Promise<AddTransactionState> {
  const t = await getTranslations("AddTransactionErrors");
  const holdingId = String(formData.get("holdingId") ?? "");
  const transactionType = String(formData.get("transactionType") ?? "buy");
  const quantity = parseDecimal(String(formData.get("quantity") ?? ""));
  const priceRaw = formData.get("price");
  const price = priceRaw ? parseDecimal(String(priceRaw)) : null;
  const transactionDate = String(formData.get("transactionDate") ?? "").trim();

  if (!holdingId) {
    return { error: t("missingHolding") };
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: t("quantityPositive") };
  }
  if (!transactionDate) {
    return { error: t("dateRequired") };
  }
  if (transactionType !== "buy" && transactionType !== "sell") {
    return { error: t("invalidType") };
  }

  const supabase = await createClient();

  if (transactionType === "sell") {
    const { data: existing } = await supabase
      .from("holding_transactions")
      .select("transaction_type, quantity, price, transaction_date")
      .eq("holding_id", holdingId);

    const mapped: HoldingTransaction[] = (existing ?? []).map((tx) => ({
      transactionType: tx.transaction_type,
      quantity: tx.quantity,
      price: tx.price,
      transactionDate: tx.transaction_date,
    }));
    const quantityHeldAtDate = computeQuantityAtDate(mapped, transactionDate);
    if (quantity > quantityHeldAtDate) {
      return { error: t("exceedsHeld", { quantity, held: quantityHeldAtDate }) };
    }
  }

  const { error: insertError } = await supabase.from("holding_transactions").insert({
    holding_id: holdingId,
    transaction_type: transactionType,
    quantity,
    price,
    transaction_date: transactionDate,
  });
  if (insertError) {
    return { error: t("insertFailed") };
  }

  revalidatePath(`/dashboard/holdings/${holdingId}`);
  revalidatePath("/dashboard");
  return {};
}

// Correcting a wrong transaction (e.g. a backfilled acquisition date) is
// delete-and-re-add rather than in-place editing — simpler and sufficient.
export async function deleteTransaction(formData: FormData): Promise<void> {
  const transactionId = String(formData.get("transactionId") ?? "");
  const holdingId = String(formData.get("holdingId") ?? "");
  if (!transactionId) return;

  const supabase = await createClient();
  await supabase.from("holding_transactions").delete().eq("id", transactionId);

  revalidatePath(`/dashboard/holdings/${holdingId}`);
  revalidatePath("/dashboard");
}

// Soft delete (see 0014_holdings_soft_delete.sql) — a hard delete used to
// cascade away holding_transactions and every dividend_events row for this
// holding, destroying real tax history for already-paid-out dividends.
// Setting deleted_at just excludes it from the active holdings list; its
// transactions and dividend events stay intact and still show up in Recent
// Activity / Tax Years.
export async function deleteHolding(holdingId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("holdings")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", holdingId);
  revalidatePath("/dashboard");
}
