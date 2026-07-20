import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

// DRAFT — grounded in what this app actually does (see specs/dividend-tax-tracker.spec.md
// Compliance NFR + Open Questions), but not reviewed by a lawyer. Replace the
// bracketed placeholders and get real legal review before relying on this.
export default async function PrivacyPage() {
  // Public page, but reachable from within the authenticated app (Settings) —
  // show a way back in rather than the logged-out marketing header, which
  // otherwise makes it look like visiting this page signed you out.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations("Privacy");
  const tNav = await getTranslations("DashboardNav");
  const tFeedback = await getTranslations("Feedback");
  const tSettings = await getTranslations("Settings");

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
        <SiteHeader />
      )}
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-neutral-300">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-50">{t("title")}</h1>
        <p className="mb-8 text-sm text-neutral-500">{t("draftNotice", { date: "2026-07-20" })}</p>

        <div className="space-y-6 text-sm leading-6">
          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("whoWeAreTitle")}</h2>
            <p>{t("whoWeAreBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("whatWeCollectTitle")}</h2>
            <p>{t("whatWeCollectBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("legalBasisTitle")}</h2>
            <p>{t("legalBasisBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("whoElseSeesItTitle")}</h2>
            <p>{t("whoElseSeesItBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("howLongTitle")}</h2>
            <p>{t("howLongBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("cookiesTitle")}</h2>
            <p>{t("cookiesBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("yourRightsTitle")}</h2>
            <p className="mb-2">{t("yourRightsIntro")}</p>
            <p>
              {t("yourRightsBefore")}{" "}
              <Link
                href="/dashboard/settings"
                className="text-emerald-400 underline hover:text-emerald-300"
              >
                {tSettings("title")}
              </Link>
              {t("yourRightsAfter")}
            </p>
            <p className="mt-2">{t("yourRightsComplaint")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("notTaxAdviceTitle")}</h2>
            <p>{t("notTaxAdviceBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("policyChangesTitle")}</h2>
            <p>{t("policyChangesBody")}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("contactTitle")}</h2>
            <p>
              {t("contactBefore")}{" "}
              <span className="text-neutral-100">{tFeedback("button")}</span> {t("contactAfter")}
            </p>
          </section>
        </div>
      </div>
      <SiteFooter defaultEmail={user?.email} />
    </div>
  );
}
