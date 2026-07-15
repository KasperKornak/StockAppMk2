"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { addTransaction, type AddTransactionState } from "./actions";

const initialState: AddTransactionState = {};

const inputClasses =
  "rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-emerald-500/50 focus:outline-none";

export function AddTransactionForm({ holdingId }: { holdingId: string }) {
  const t = useTranslations("AddTransactionForm");
  const [state, formAction, pending] = useActionState(addTransaction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mt-6 rounded-xl border border-neutral-800 p-5">
      <h2 className="text-sm font-medium text-neutral-300">{t("title")}</h2>
      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="holdingId" value={holdingId} />
        <div className="flex flex-col gap-1">
          <label htmlFor="transactionType" className="text-sm text-neutral-500">
            {t("typeLabel")}
          </label>
          <select
            id="transactionType"
            name="transactionType"
            defaultValue="buy"
            className={inputClasses}
          >
            <option value="buy">{t("buy")}</option>
            <option value="sell">{t("sell")}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="txQuantity" className="text-sm text-neutral-500">
            {t("quantityLabel")}
          </label>
          <input
            id="txQuantity"
            name="quantity"
            type="text"
            inputMode="decimal"
            required
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="txPrice" className="text-sm text-neutral-500">
            {t("priceLabel")}
          </label>
          <input id="txPrice" name="price" type="text" inputMode="decimal" className={inputClasses} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="txDate" className="text-sm text-neutral-500">
            {t("dateLabel")}
          </label>
          <input
            id="txDate"
            name="transactionDate"
            type="date"
            required
            defaultValue={today}
            max={today}
            className={inputClasses}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-full bg-emerald-500 px-5 font-medium text-neutral-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>
      {state.error && <p className="mt-3 text-sm text-red-400">{state.error}</p>}
    </div>
  );
}
