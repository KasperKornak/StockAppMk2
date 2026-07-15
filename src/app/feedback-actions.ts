"use server";

import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export interface FeedbackState {
  success?: boolean;
  error?: string;
}

// Doubles as the app's public "Contact" channel (see Privacy Policy) — works
// for both authenticated and anonymous submitters, so no personal email
// needs to be published anywhere.
export async function submitFeedback(
  _prevState: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const message = String(formData.get("message") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const t = await getTranslations("Feedback");

  if (!message) {
    return { error: t("errorEmpty") };
  }
  if (message.length > 4000) {
    return { error: t("errorTooLong") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("feedback").insert({
    user_id: user?.id ?? null,
    email: email || user?.email || null,
    message,
  });

  if (error) {
    return { error: t("errorGeneric") };
  }

  return { success: true };
}
