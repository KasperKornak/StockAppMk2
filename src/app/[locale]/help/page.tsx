import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HelpPage() {
  // Public page, but reachable from within the authenticated app (dashboard
  // nav) — show a way back in rather than the logged-out marketing header,
  // same reasoning as the Privacy Policy page.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations("Help");
  const tNav = await getTranslations("DashboardNav");

  return (
    <div className="flex flex-1 flex-col">
      {user ? (
        <header className="relative z-10 border-b border-neutral-900">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-emerald-400"
            >
              {tNav("backToDashboard")}
            </Link>
            <span className="text-sm text-neutral-500">{user.email}</span>
          </div>
        </header>
      ) : (
        <SiteHeader authenticated={Boolean(user)} />
      )}
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-neutral-300">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-50">{t("title")}</h1>
        <p className="mb-8 text-sm text-neutral-500">{t("intro")}</p>

        <div className="space-y-6 text-sm leading-6">
          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("taxCalcTitle")}</h2>
            <p>{t("taxCalcBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("statusesTitle")}</h2>
            <p>{t("statusesBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("w8benTitle")}</h2>
            <p>{t("w8benBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("addingHoldingsTitle")}</h2>
            <p>{t("addingHoldingsBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("notificationsTitle")}</h2>
            <p>{t("notificationsBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("taxYearsTitle")}</h2>
            <p>{t("taxYearsBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("dataTitle")}</h2>
            <p>{t("dataBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("stillStuckTitle")}</h2>
            <p>{t("stillStuckBody")}</p>
          </section>
        </div>
      </div>
      <SiteFooter defaultEmail={user?.email} />
    </div>
  );
}
