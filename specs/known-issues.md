# Known Issues

Tracked list of open bugs/feedback, consolidated because the volume from manual testing got hard to track in chat. Status as of 2026-07-20. Not prioritized — that's a separate conversation.

## Critical — likely explains the dividend sync problem

- **Cron sync times out (504 FUNCTION_INVOCATION_TIMEOUT) before finishing.** Confirmed via a real Vercel function log: `/api/cron/sync-dividends` hit Vercel's 60s `maxDuration` ceiling mid-run, after processing several tickers but before reaching `finalizeMaturedDividendEvents` (which runs last, after the full per-ticker loop). Massive's 5 req/min rate limit means each additional unique ticker adds real wall-clock time to the loop — once total unique tickers across all users pushes the loop past ~60s, finalize never runs on *any* invocation, not just an occasional one. This is very likely why NTR (and possibly other holdings) never got confirmed. Needs an architectural fix, not just a retry — candidates: run finalize *before* the ticker-creation loop (so already-pending work finishes even if new-ticker processing times out), reduce per-run workload (process a subset of tickers per invocation), or raise `maxDuration` (requires Vercel Pro, 300s ceiling — still not unlimited).

## UI/UX

- **Mobile: footer feels unreachable.** After the responsive table fix, Feedback/Privacy Policy/"Made in Bronowice" require noticeably more scrolling on the dashboard than expected. Needs a look — may just be normal page length with the new card layout, may not be an actual bug.
- **Favicon still shows the Vercel default in the browser tab**, despite the icon.tsx fix being deployed. Likely aggressive browser favicon caching (browsers cache favicons separately from normal page cache) — needs verification that the new icon is actually being served in production before assuming it's a caching issue.
- **Dividend events table still requires horizontal scroll** on the viewport being tested. The `sm:` (640px) breakpoint for switching to the mobile card layout is too narrow for whatever device/width is in use — table needs either a larger breakpoint (e.g. `lg:` / 1024px) or fewer/narrower columns so it fits without scrolling at more widths.
- **404 page**: root-level fallback shows bilingual text, which reads as cluttered/wrong — want single-language text even on the un-routable fallback (e.g. read the `NEXT_LOCALE` cookie to guess). Also: the 🧭 compass emoji doesn't fit the site's visual theme — reconsider (maybe reuse the 💸 mascot for consistency instead of a new symbol).
- **Settings page gives no feedback when saving** — the Save button submits with no visible confirmation that anything happened.
- **No pointer cursor on hover for any button site-wide.** Very likely Tailwind's Preflight base reset, which intentionally sets `cursor: default` on `<button>` elements instead of leaving the browser's native pointer cursor. Needs a global fix (base CSS rule), not per-component.

## Needs more investigation

- **Visiting odlicz.com directly (typing in the address bar) while logged in doesn't show as authenticated**, even though `www.odlicz.com` → `odlicz.com` is confirmed correctly redirecting (308) at the Vercel level — so this isn't the domain-mismatch cookie issue originally suspected. The landing page's "show Go to Dashboard if logged in" logic (added earlier) apparently isn't triggering. Root cause unconfirmed.

## Resolved this session (for reference — remove once confirmed stable)

- Header overflow/wrapping on mobile
- Holdings table mobile layout (initial pass — see scrolling issue above, not fully resolved)
- Turnstile widget not appearing on second page after client-side nav (login ↔ signup)
- Turnstile hostname coverage (user added both `odlicz.com` and `www.odlicz.com`)
- Sync-frequency disclaimer copy
- Privacy Policy RODO refresh
