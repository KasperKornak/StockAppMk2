import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * FR-NOTIF-002: the dividend event itself is always recorded regardless of
 * preferences — only the notification is skipped when in-app is disabled.
 */
export async function createNotificationIfEnabled(
  supabase: SupabaseClient,
  userId: string,
  dividendEventId: string,
  type: "upcoming" | "confirmed",
): Promise<void> {
  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("in_app_enabled")
    .eq("user_id", userId)
    .maybeSingle();

  if (prefs?.in_app_enabled === false) {
    return;
  }

  await supabase
    .from("notifications")
    .upsert(
      { user_id: userId, dividend_event_id: dividendEventId, type },
      { onConflict: "dividend_event_id,type", ignoreDuplicates: true },
    );
}
