"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState } from "react";
import { addHolding, requestTickerSupport, type AddHoldingState } from "./actions";

const initialState: AddHoldingState = {};

const inputClasses =
  "rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none";

export function AddHoldingForm() {
  const t = useTranslations("AddHoldingForm");
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Bumped every time the dialog opens, forcing AddHoldingFormContent to
  // remount so useActionState starts fresh (otherwise a stale `success: true`
  // from the last submission would immediately re-close the next dialog).
  const [modalKey, setModalKey] = useState(0);

  function openModal() {
    setModalKey((k) => k + 1);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button
        onClick={openModal}
        className="mt-8 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
      >
        {t("openButton")}
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
        className="fixed top-1/2 left-1/2 m-0 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-800 bg-neutral-950 p-0 text-neutral-100 backdrop:bg-black/60"
      >
        <AddHoldingFormContent key={modalKey} onClose={() => dialogRef.current?.close()} />
      </dialog>
    </>
  );
}

function AddHoldingFormContent({ onClose }: { onClose: () => void }) {
  const t = useTranslations("AddHoldingForm");
  const [state, formAction, pending] = useActionState(addHolding, initialState);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  return (
    <div className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-300">{t("title")}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-neutral-500 hover:text-neutral-300"
        >
          ✕
        </button>
      </div>
      <p className="mb-4 text-sm text-neutral-500">{t("description")}</p>
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="ticker" className="text-sm text-neutral-500">
            {t("tickerLabel")}
          </label>
          <input
            id="ticker"
            name="ticker"
            required
            placeholder={t("tickerPlaceholder")}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="quantity" className="text-sm text-neutral-500">
            {t("quantityLabel")}
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            step="any"
            min="0"
            required
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="price" className="text-sm text-neutral-500">
            {t("pricePaidLabel")}
          </label>
          <input id="price" name="price" type="number" step="any" min="0" className={inputClasses} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="acquiredDate" className="text-sm text-neutral-500">
            {t("dateAcquiredLabel")}
          </label>
          <input
            id="acquiredDate"
            name="acquiredDate"
            type="date"
            required
            defaultValue={today}
            max={today}
            className={inputClasses}
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-neutral-400">
          <input name="w8benConfirmed" type="checkbox" />
          {t("w8benLabel")}
        </label>
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-full bg-emerald-500 px-5 font-medium text-neutral-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>

      {state.error && (
        <div className="mt-3 text-sm text-red-400">
          {state.error}
          {state.unsupportedTicker && (
            <form action={requestTickerSupport} className="mt-2">
              <input type="hidden" name="ticker" value={state.unsupportedTicker} />
              <button type="submit" className="text-emerald-400 underline hover:text-emerald-300">
                {t("requestSupport", { ticker: state.unsupportedTicker })}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
