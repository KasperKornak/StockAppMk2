# Known Issues

Tracked list of open bugs/feedback, consolidated because the volume from manual testing got hard to track in chat. Status as of 2026-07-23. Not prioritized — that's a separate conversation.

## UI/UX

- **Mobile: footer feels unreachable.** After the responsive table fix, Feedback/Privacy Policy/"Made in Bronowice" require noticeably more scrolling on the dashboard than expected. Needs a look — may just be normal page length with the new card layout, may not be an actual bug.

## Resolved (for reference — remove once confirmed stable in production)

- Cron sync timing out (504) before `finalizeMaturedDividendEvents` ran — reordered so finalize/qualify run before the per-ticker Massive loop.
- Header overflow/wrapping on mobile.
- Holdings table + dividend events table mobile layout — bumped breakpoint from `sm:` to `lg:`.
- Turnstile widget not appearing on second page after client-side nav (login ↔ signup).
- Turnstile hostname coverage (user added both `odlicz.com` and `www.odlicz.com`).
- Sync-frequency disclaimer copy.
- Privacy Policy RODO refresh.
- 404 page bilingual text + mismatched emoji — now locale-aware (reads `NEXT_LOCALE` cookie) with on-brand styling.
- Settings page gave no save feedback — now shows "Saving…"/"Saved.".
- No pointer cursor on buttons site-wide — global CSS override for Tailwind Preflight's `cursor: default` reset.
- Favicon showing Vercel default in production — root cause was `proxy.ts`'s middleware matcher hijacking `/icon` and `/apple-icon` (no file extension in the URL, so the exclusion regex missed them and next-intl 404'd them).
- Login/Signup buttons still shown in the header while authenticated on the landing page — `SiteHeader` now takes an `authenticated` prop.
- Dividend status labels unclear — added a "?" legend button explaining upcoming/qualified/paid-out, and renamed "confirmed" to "paid out".
- Ticker input was free-text only — added an autocomplete combobox backed by a curated list of common tickers; submission is still validated against Massive either way.
