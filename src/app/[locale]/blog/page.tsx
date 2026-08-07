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
  const t = await getTranslations({ locale, namespace: "Blog" });
  return {
    title: t("title"),
    alternates: localeAlternates("/blog"),
  };
}

// Just one post today — a plain list rather than a CMS/MDX pipeline, since
// there's nothing yet that justifies that complexity. Add a new <li> here
// (and a new page under blog/<slug>) when the next article is ready.
export default async function BlogIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations("Blog");

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader authenticated={Boolean(user)} />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-neutral-300">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-50">{t("title")}</h1>
        <p className="mb-10 text-sm text-neutral-500">{t("intro")}</p>

        <ul className="space-y-6">
          <li className="rounded-xl border border-neutral-800 p-5">
            <h2 className="mb-2 font-medium text-neutral-100">
              <Link
                href="/blog/dividend-investing-belka-tax"
                className="hover:text-emerald-400"
              >
                {t("dividendGuideCardTitle")}
              </Link>
            </h2>
            <p className="mb-3 text-sm leading-6 text-neutral-400">
              {t("dividendGuideCardExcerpt")}
            </p>
            <Link
              href="/blog/dividend-investing-belka-tax"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              {t("readMore")}
            </Link>
          </li>
        </ul>
      </div>
      <SiteFooter defaultEmail={user?.email} />
    </div>
  );
}
