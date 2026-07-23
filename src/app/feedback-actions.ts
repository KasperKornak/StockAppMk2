"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface FeedbackState {
  success?: boolean;
  error?: string;
}

const MIN_FILL_TIME_MS = 1500;
const MAX_SUBMISSIONS_PER_IP_PER_HOUR = 5;

// Doubles as the app's public "Contact" channel (see Privacy Policy) — works
// for both authenticated and anonymous submitters, so no personal email
// needs to be published anywhere. Anonymous + unauthenticated access means
// this is reachable directly via the Supabase REST API, not just this form —
// the anti-spam checks below can't assume they only ever see honest submits.
export async function submitFeedback(
  _prevState: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const message = String(formData.get("message") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const t = await getTranslations("Feedback");

  // Honeypot: real users never see or fill this field (hidden via CSS in
  // FeedbackFormContent). Scripted bots that blindly fill every input do.
  const honeypot = String(formData.get("website") ?? "").trim();
  const renderedAt = Number(formData.get("renderedAt") ?? 0);
  const isBot =
    honeypot.length > 0 || !renderedAt || Date.now() - renderedAt < MIN_FILL_TIME_MS;
  if (isBot) {
    // Pretend success rather than exposing the check, so a script probing
    // this endpoint can't tell which signal tripped it.
    return { success: true };
  }

  if (!message) {
    return { error: t("errorEmpty") };
  }
  if (message.length > 4000) {
    return { error: t("errorTooLong") };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  if (ip) {
    // Regular callers have no select policy on `feedback` (see migration
    // 0012) — this count is an internal rate-limit check, never returned to
    // the caller, so the service-role client is appropriate here.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await createServiceRoleClient()
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", oneHourAgo);
    if ((count ?? 0) >= MAX_SUBMISSIONS_PER_IP_PER_HOUR) {
      return { error: t("errorRateLimited") };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("feedback").insert({
    user_id: user?.id ?? null,
    email: email || user?.email || null,
    message,
    ip,
  });

  if (error) {
    return { error: t("errorGeneric") };
  }

  return { success: true };
}
