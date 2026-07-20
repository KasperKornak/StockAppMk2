"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Link } from "@/i18n/navigation";

export default function ErrorBoundary({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-neutral-50">{t("title")}</h1>
      <p className="text-neutral-400">{t("body")}</p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => unstable_retry()}
          className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-700 px-6 font-medium text-neutral-100 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
