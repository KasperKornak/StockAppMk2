import { useTranslations } from "next-intl";
import { FeedbackButton } from "@/components/feedback-form";
import { Link } from "@/i18n/navigation";

export function SiteFooter({ defaultEmail }: { defaultEmail?: string }) {
  const t = useTranslations("SiteFooter");
  const tSettings = useTranslations("Settings");

  return (
    <footer className="relative border-t border-neutral-900 px-6 py-8">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-3 text-center text-sm text-neutral-500 sm:grid-cols-3 sm:text-left">
        <span>{t("appName")}</span>
        <span className="sm:text-center">{t("disclaimer")}</span>
        <div className="flex items-center justify-center gap-4 sm:justify-end">
          <Link href="/help" className="underline hover:text-neutral-300">
            {t("helpLink")}
          </Link>
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
