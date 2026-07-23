# Known Issues

Tracked list of open bugs/feedback, consolidated because the volume from manual testing got hard to track in chat. Status as of 2026-07-24. Not prioritized — that's a separate conversation.

## UI/UX

- **Mobile: footer feels unreachable.** After the responsive table fix, Feedback/Privacy Policy/"Made in Bronowice" require noticeably more scrolling on the dashboard than expected. Needs a look — may just be normal page length with the new card layout, may not be an actual bug.

## Needs the owner to apply pending migrations

- `supabase/migrations/0013_feedback_rate_limit.sql` and `0014_holdings_soft_delete.sql` are written but not yet applied to production — see chat for the exact apply steps.

## Resolved (for reference — remove once confirmed stable in production)

- Feedback form had no anti-spam protection at all (open insert policy, no rate limit) — added a honeypot field + fill-time check, and a per-IP rate limit (5/hour).
- Deleting a holding hard-deleted its dividend history, including already-paid-out dividends — switched to soft delete (`deleted_at`), so history stays visible in Recent Activity / Tax Years.
- Data export read like a raw database dump (internal ids/foreign keys) — reshaped into a nested, human-readable format instead.
- No user-facing documentation on how the app/tax calc works — added a bilingual `/help` page, linked from the dashboard nav and public footer.
- Average price and YTD dividends columns lacked currency/gross clarity — added currency to avg price, and "(gross)"/"(brutto)" to the YTD dividends label.
- Adding a ticker you already hold errored as a duplicate — now adds a buy transaction to the existing holding instead.
- Tax Years "by holding" table had the same mobile/alignment issues as the old dashboard tables — same fixes applied (mobile card layout, wider container).
- Header spacing too tight on mobile when it wraps to two lines.
- Turnstile single-use tokens could be resent on a retried login/signup after a failed attempt, causing a spurious "captcha protection: request disallowed" error — widget now remounts (fresh token) after any error.
- Notification dropdown could open off-screen to the left on mobile — now viewport-anchored below `sm`.
- Settings page's Export/Delete buttons had text overflowing the button frame on mobile — now stack vertically with auto height.

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
