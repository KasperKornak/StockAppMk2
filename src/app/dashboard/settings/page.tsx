import { createClient } from "@/lib/supabase/server";
import { updateNotificationPreferences } from "./actions";
import { DataActions } from "./data-actions";

// FR-NOTIF-001: per-user email/in-app notification toggles.
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: preferences } = await supabase
    .from("notification_preferences")
    .select("email_enabled, in_app_enabled")
    .eq("user_id", user!.id)
    .maybeSingle();

  const emailEnabled = preferences?.email_enabled ?? true;
  const inAppEnabled = preferences?.in_app_enabled ?? true;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="mb-5 text-sm font-medium text-neutral-300">Settings</h1>

      <div className="rounded-xl border border-neutral-800 p-5">
        <h2 className="text-sm font-medium text-neutral-300">Notification preferences</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Choose how you want to hear about upcoming and confirmed dividend payouts.
        </p>

        <form action={updateNotificationPreferences} className="mt-5 flex flex-col gap-4">
          <label className="flex items-center gap-3 text-sm text-neutral-100">
            <input
              name="emailEnabled"
              type="checkbox"
              defaultChecked={emailEnabled}
              className="h-4 w-4 accent-emerald-500"
            />
            Email notifications
          </label>
          <label className="flex items-center gap-3 text-sm text-neutral-100">
            <input
              name="inAppEnabled"
              type="checkbox"
              defaultChecked={inAppEnabled}
              className="h-4 w-4 accent-emerald-500"
            />
            In-app notifications
          </label>

          <div>
            <button
              type="submit"
              className="h-10 rounded-full bg-emerald-500 px-5 font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      <DataActions />

      <p className="mt-6 text-sm text-neutral-500">
        <a href="/privacy" className="underline hover:text-neutral-300">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
