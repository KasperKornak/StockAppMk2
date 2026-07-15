import { useTranslations } from "next-intl";
import { FeedbackButton } from "@/components/feedback-form";
import { Link } from "@/i18n/navigation";

export function SiteFooter({ defaultEmail }: { defaultEmail?: string }) {
  const t = useTranslations("SiteFooter");
  const tSettings = useTranslations("Settings");

  return (
    <footer className="relative border-t border-neutral-900 px-6 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 text-sm text-neutral-500">
        <span>{t("appName")}</span>
        <span>{t("disclaimer")}</span>
        <div className="flex items-center gap-4">
          <FeedbackButton defaultEmail={defaultEmail} />
          <Link href="/privacy" className="underline hover:text-neutral-300">
            {tSettings("privacyLink")}
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-3 w-full max-w-4xl text-center text-xs text-neutral-600">
        {t("madeIn")}
      </div>
    </footer>
  );
}
