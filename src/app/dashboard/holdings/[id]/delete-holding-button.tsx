"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteHolding } from "./actions";

export function DeleteHoldingButton({
  holdingId,
  ticker,
}: {
  holdingId: string;
  ticker: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `Delete ${ticker}? This removes the holding and all its transactions and dividend history.`,
    );
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
      {pending ? "Deleting…" : "Delete holding"}
    </button>
  );
}
