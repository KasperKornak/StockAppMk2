import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  const tNav = await getTranslations("DashboardNav");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-neutral-50">{t("title")}</h1>
      <p className="text-neutral-400">{t("body")}</p>
      <Link
        href={user ? "/dashboard" : "/"}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
      >
        {user ? tNav("backToDashboard") : t("backHome")}
      </Link>
    </div>
  );
}
