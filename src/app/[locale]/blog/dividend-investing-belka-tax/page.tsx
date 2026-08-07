import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { localeAlternates } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogDividendGuide" });
  return {
    title: t("title"),
    description: t("dek"),
    alternates: localeAlternates("/blog/dividend-investing-belka-tax"),
  };
}

export default async function DividendGuidePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations("BlogDividendGuide");
  const tLanding = await getTranslations("Landing");

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader authenticated={Boolean(user)} />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-neutral-300">
        <Link href="/blog" className="text-sm text-neutral-500 hover:text-neutral-300">
          {t("backToBlog")}
        </Link>

        <h1 className="mt-4 mb-2 text-2xl font-semibold text-neutral-50">{t("title")}</h1>
        <p className="mb-10 text-base leading-7 text-neutral-400">{t("dek")}</p>

        <article className="space-y-6 text-sm leading-6">
          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("section1Title")}</h2>
            <p>{t("section1Body")}</p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("section2Title")}</h2>
            <p>{t("section2Body")}</p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("section3Title")}</h2>
            <p>{t("section3Body")}</p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("section4Title")}</h2>
            <p>{t("section4Body")}</p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("section5Title")}</h2>
            <p>{t("section5Body")}</p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("section6Title")}</h2>
            <p>{t("section6Body")}</p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("section7Title")}</h2>
            <p>{t("section7Body")}</p>
          </section>
          <section>
            <h2 className="mb-2 font-medium text-neutral-100">{t("section8Title")}</h2>
            <p>{t("section8Body")}</p>
          </section>
        </article>

        <p className="mt-10 border-t border-neutral-900 pt-6 text-xs text-neutral-600">
          {t("disclaimer")}
        </p>

        {!user && (
          <div className="mt-10 rounded-xl border border-neutral-800 p-5 text-center">
            <Link
              href="/signup"
              className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
            >
              {tLanding("getStarted")}
            </Link>
          </div>
        )}
      </div>
      <SiteFooter defaultEmail={user?.email} />
    </div>
  );
}
