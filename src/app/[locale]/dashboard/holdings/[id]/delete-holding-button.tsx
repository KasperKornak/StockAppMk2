"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { deleteHolding } from "./actions";

export function DeleteHoldingButton({
  holdingId,
  ticker,
}: {
  holdingId: string;
  ticker: string;
}) {
  const router = useRouter();
  const t = useTranslations("HoldingDetail");
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(t("deleteHoldingConfirm", { ticker }));
    if (!confirmed) return;

    startTransition(async () => {
      await deleteHolding(holdingId);
      router.push("/dashboard");
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="rounded-full border border-red-900 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/50 disabled:opacity-50"
    >
      {pending ? t("deleteHoldingDeleting") : t("deleteHoldingButton")}
    </button>
  );
}
