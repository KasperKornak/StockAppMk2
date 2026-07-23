"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface UpdateNotificationPreferencesState {
  saved?: boolean;
}

// FR-NOTIF-001: users independently toggle email/in-app notifications.
export async function updateNotificationPreferences(
  _prevState: UpdateNotificationPreferencesState,
  formData: FormData,
): Promise<UpdateNotificationPreferencesState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const inAppEnabled = formData.get("inAppEnabled") === "on";

  // email_enabled isn't touched here — email notifications aren't wired up
  // yet (see specs/roadmap.md), and the Settings UI disables that checkbox.
  await supabase
    .from("notification_preferences")
    .update({ in_app_enabled: inAppEnabled })
    .eq("user_id", user.id);

  revalidatePath("/dashboard/settings");
  return { saved: true };
}

// GDPR data export — every table is scoped by the caller's own RLS-enforced
// session, so plain unfiltered selects can't leak another user's rows.
// Shaped as holdings-with-nested-history rather than a straight per-table
// dump: no internal ids/foreign keys, so it doesn't read like a raw
// database export to someone who isn't a DB admin.
export async function exportMyData(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const [profile, holdings, transactions, dividendEvents, preferences] = await Promise.all([
    supabase.from("profiles").select("created_at").eq("id", user.id).maybeSingle(),
    supabase
      .from("holdings")
      .select("id, ticker, domicile, currency, w8ben_confirmed, withholding_rate_override, deleted_at"),
    supabase
      .from("holding_transactions")
      .select("holding_id, transaction_type, quantity, price, transaction_date"),
    supabase
      .from("dividend_events")
      .select(
        "holding_id, status, ex_dividend_date, pay_date, gross_amount_foreign, foreign_currency, foreign_withholding_rate, nbp_fx_rate, gross_amount_pln, polish_tax_due_pln, foreign_tax_credit_pln, amount_to_set_aside_pln",
      ),
    supabase.from("notification_preferences").select("email_enabled, in_app_enabled").eq("user_id", user.id).maybeSingle(),
  ]);

  const transactionsByHolding = new Map<string, typeof transactions.data>();
  for (const row of transactions.data ?? []) {
    const list = transactionsByHolding.get(row.holding_id) ?? [];
    list.push(row);
    transactionsByHolding.set(row.holding_id, list);
  }
  const dividendsByHolding = new Map<string, typeof dividendEvents.data>();
  for (const row of dividendEvents.data ?? []) {
    const list = dividendsByHolding.get(row.holding_id) ?? [];
    list.push(row);
    dividendsByHolding.set(row.holding_id, list);
  }

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      account: { email: user.email, memberSince: profile.data?.created_at ?? null },
      notificationPreferences: {
        emailEnabled: preferences.data?.email_enabled ?? null,
        inAppEnabled: preferences.data?.in_app_enabled ?? null,
      },
      holdings: (holdings.data ?? []).map((h) => ({
        ticker: h.ticker,
        domicile: h.domicile,
        currency: h.currency,
        w8benConfirmed: h.w8ben_confirmed,
        withholdingRateOverride: h.withholding_rate_override,
        removedFromDashboard: h.deleted_at !== null,
        transactions: (transactionsByHolding.get(h.id) ?? []).map((tx) => ({
          type: tx.transaction_type,
          quantity: tx.quantity,
          price: tx.price,
          date: tx.transaction_date,
        })),
        dividends: (dividendsByHolding.get(h.id) ?? []).map((d) => ({
          status: d.status,
          exDividendDate: d.ex_dividend_date,
          payDate: d.pay_date,
          grossAmountForeign: d.gross_amount_foreign,
          foreignCurrency: d.foreign_currency,
          foreignWithholdingRate: d.foreign_withholding_rate,
          nbpFxRate: d.nbp_fx_rate,
          grossAmountPln: d.gross_amount_pln,
          polishTaxDuePln: d.polish_tax_due_pln,
          foreignTaxCreditPln: d.foreign_tax_credit_pln,
          amountToSetAsidePln: d.amount_to_set_aside_pln,
        })),
      })),
    },
    null,
    2,
  );
}

// GDPR account deletion — deleting the auth user cascades all the way down
// (profiles -> holdings -> holding_transactions/dividend_events/notifications,
// see the "on delete cascade" chain across migrations 0001/0007/0010).
// Requires the service role since there's no self-delete in the public
// GoTrue API; the user id comes from the caller's own session, not from
// client input, so this can't be used to delete anyone else's account.
export async function deleteMyAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const serviceClient = createServiceRoleClient();
  await serviceClient.auth.admin.deleteUser(user.id);
  await supabase.auth.signOut();
}
