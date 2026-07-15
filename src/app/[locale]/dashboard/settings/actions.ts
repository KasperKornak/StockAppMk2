"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// FR-NOTIF-001: users independently toggle email/in-app notifications.
export async function updateNotificationPreferences(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const emailEnabled = formData.get("emailEnabled") === "on";
  const inAppEnabled = formData.get("inAppEnabled") === "on";

  await supabase
    .from("notification_preferences")
    .update({ email_enabled: emailEnabled, in_app_enabled: inAppEnabled })
    .eq("user_id", user.id);

  revalidatePath("/dashboard/settings");
}

// GDPR data export — every table is scoped by the caller's own RLS-enforced
// session, so plain unfiltered selects can't leak another user's rows.
export async function exportMyData(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const [profile, holdings, transactions, dividendEvents, notifications, preferences] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("holdings").select("*"),
      supabase.from("holding_transactions").select("*"),
      supabase.from("dividend_events").select("*"),
      supabase.from("notifications").select("*"),
      supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      account: { id: user.id, email: user.email },
      profile: profile.data,
      holdings: holdings.data,
      holdingTransactions: transactions.data,
      dividendEvents: dividendEvents.data,
      notifications: notifications.data,
      notificationPreferences: preferences.data,
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
