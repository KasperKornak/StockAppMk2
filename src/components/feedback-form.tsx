"use client";

import { useTranslations } from "next-intl";
import { useActionState, useRef, useState } from "react";
import { submitFeedback, type FeedbackState } from "@/app/feedback-actions";

const initialState: FeedbackState = {};

const inputClasses =
  "rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500/50 focus:outline-none";

export function FeedbackButton({
  defaultEmail,
  className,
}: {
  defaultEmail?: string;
  className?: string;
}) {
  const t = useTranslations("Feedback");
  const dialogRef = useRef<HTMLDialogElement>(null);
  // See AddHoldingForm for why the content remounts on every open.
  const [modalKey, setModalKey] = useState(0);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setModalKey((k) => k + 1);
          dialogRef.current?.showModal();
        }}
        className={className ?? "underline hover:text-neutral-300"}
      >
        {t("button")}
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
        className="fixed top-1/2 left-1/2 m-0 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-800 bg-neutral-950 p-0 text-neutral-100 backdrop:bg-black/60"
      >
        <FeedbackFormContent
          key={modalKey}
          defaultEmail={defaultEmail}
          onClose={() => dialogRef.current?.close()}
        />
      </dialog>
    </>
  );
}

function FeedbackFormContent({
  defaultEmail,
  onClose,
}: {
  defaultEmail?: string;
  onClose: () => void;
}) {
  const t = useTranslations("Feedback");
  const [state, formAction, pending] = useActionState(submitFeedback, initialState);
  // Set once when the form mounts — the server rejects submissions sent
  // implausibly soon after (see MIN_FILL_TIME_MS in feedback-actions.ts).
  const [renderedAt] = useState(() => Date.now());

  return (
    <div className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-300">{t("title")}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="text-neutral-500 hover:text-neutral-300"
        >
          ✕
        </button>
      </div>

      {state.success ? (
        <div className="py-4">
          <p className="text-sm text-neutral-300">{t("success")}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 h-10 rounded-full bg-emerald-500 px-5 text-sm font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            {t("close")}
          </button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-neutral-500">{t("description")}</p>
          <form action={formAction} className="flex flex-col gap-3">
            {/* Honeypot — hidden from real users via CSS (not `type="hidden"`,
                which some bots skip filling), a scripted bot filling every
                field will still fill this one. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute h-px w-px overflow-hidden opacity-0"
            />
            <input type="hidden" name="renderedAt" value={renderedAt} />
            <textarea
              name="message"
              required
              rows={4}
              placeholder={t("messagePlaceholder")}
              className={inputClasses}
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="feedback-email" className="text-sm text-neutral-500">
                {t("emailLabel")}
              </label>
              <input
                id="feedback-email"
                name="email"
                type="email"
                defaultValue={defaultEmail}
                placeholder={t("emailPlaceholder")}
                className={inputClasses}
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="h-10 self-start rounded-full bg-emerald-500 px-5 text-sm font-medium text-neutral-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
            >
              {pending ? t("sending") : t("send")}
            </button>
          </form>
          {state.error && <p className="mt-3 text-sm text-red-400">{state.error}</p>}
        </>
      )}
    </div>
  );
}
