"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import {
  updateNotificationPreferences,
  type UpdateNotificationPreferencesState,
} from "./actions";

const initialState: UpdateNotificationPreferencesState = {};

export function NotificationPreferencesForm({ inAppEnabled }: { inAppEnabled: boolean }) {
  const t = useTranslations("Settings");
  const [state, formAction, pending] = useActionState(
    updateNotificationPreferences,
    initialState,
  );

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-4">
      <label className="flex items-center gap-3 text-sm text-neutral-500">
        <input type="checkbox" disabled className="h-4 w-4 accent-emerald-500" />
        {t("emailNotifications")}
        <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
          {t("comingSoon")}
        </span>
      </label>
      <label className="flex items-center gap-3 text-sm text-neutral-100">
        <input
          name="inAppEnabled"
          type="checkbox"
          defaultChecked={inAppEnabled}
          className="h-4 w-4 accent-emerald-500"
        />
        {t("inAppNotifications")}
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-full bg-emerald-500 px-5 font-medium text-neutral-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? t("saving") : t("save")}
        </button>
        {state.saved && !pending && <span className="text-sm text-emerald-400">{t("saved")}</span>}
      </div>
    </form>
  );
}
