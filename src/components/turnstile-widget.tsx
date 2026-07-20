"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          language?: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

// FR-AUTH: Cloudflare Turnstile bot check on login/signup. The site key is
// public (safe client-side); verification happens server-side inside
// Supabase Auth using the secret key configured in the Supabase dashboard —
// this app never sees or needs the secret key.
export function TurnstileWidget({
  siteKey,
  language,
  onVerify,
}: {
  siteKey: string;
  language?: string;
  onVerify: (token: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Client-side navigation (e.g. login <-> signup) doesn't remove the
  // <script> tag from a previous page, so next/script's onLoad only fires
  // once ever — never again for a fresh TurnstileWidget instance mounted on
  // the second page. Read the external script state directly as the initial
  // value instead of waiting forever for a load event that already happened
  // before this component existed.
  const [scriptLoaded, setScriptLoaded] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );

  // Ref so the render effect below doesn't need onVerify in its deps —
  // callers typically pass an inline setState function that's stable in
  // behavior but not in identity. Updated in an effect, not during render,
  // per the rules of React (refs can't be mutated while rendering).
  const onVerifyRef = useRef(onVerify);
  useEffect(() => {
    onVerifyRef.current = onVerify;
  });

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      language,
      callback: (token) => onVerifyRef.current(token),
      "expired-callback": () => onVerifyRef.current(null),
      "error-callback": () => onVerifyRef.current(null),
    });

    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [scriptLoaded, siteKey, language]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} />
    </>
  );
}
