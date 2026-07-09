# Feature: Dividend Tax Tracker

## Overview
A web app for Polish tax residents who hold dividend-paying stocks/ETFs. Users add their holdings, and the app automatically detects upcoming and confirmed dividend payouts, calculates how much Polish tax (Belka tax, 19%) they still owe after crediting foreign withholding tax already deducted at source, and tells them how much PLN to set aside — using the correct NBP exchange rate for the payout date. Solves the problem of Polish investors under/over-estimating year-end tax liability on foreign dividends, which is legally complex due to per-country treaty rates and FX conversion rules.

## Target Users & Scope
- Public product, free at launch, but the data model and account structure must not block adding a paid tier later (see Extensibility NFR).
- Polish tax residents holding stocks/ETFs domiciled anywhere, with treaty-rate coverage prioritized for the US and other major markets at launch.
- Small-scale launch (dozens–hundreds of users); infrastructure should favor low fixed cost over scalability headroom.
- MVP explicitly excludes: broker/API account sync, itemized per-transaction lot tracking (aggregate position only for now), PIT-38 form generation, mobile app, non-Polish tax residency, billing/payment processing itself.

## Functional Requirements

### Auth

**FR-AUTH-001**: Registration
When a user submits the signup form with email and password, the system shall create an unverified account and send a verification email.

**FR-AUTH-002**: Email Verification Gate
While an account is unverified, when the user attempts to log in, the system shall allow login but restrict access to holding/dividend features until verified.

**FR-AUTH-003**: OAuth Login
The system shall support login/signup via at least one OAuth provider (e.g., Google) in addition to email/password.

**FR-AUTH-004**: Login
While credentials are valid, when a login is submitted, the system shall create an authenticated session.

### Holdings

**FR-HOLD-001**: Add Holding
When a user adds a holding, the system shall require a ticker and quantity, and shall accept an optional average purchase price.

**FR-HOLD-002**: Domicile Auto-Lookup
When a valid, supported ticker is entered, the system shall automatically determine the company's tax domicile from market reference data (independent of the exchange the ticker trades on).

**FR-HOLD-003**: Unsupported Ticker Rejection
When a ticker has no domicile or dividend reference data available, the system shall reject the holding and display a message that the ticker is not yet supported.

**FR-HOLD-007**: Request Ticker Support
When a ticker is rejected as unsupported, the system shall offer a way to request that ticker be added (e.g., a "Request this ticker" button that notifies support with the ticker symbol and requesting user).

**FR-HOLD-004**: Default Withholding Rate Suggestion
When a holding's domicile is determined, the system shall suggest a default effective foreign withholding tax rate for that domicile (e.g., US = 15% assuming W-8BEN on file, UK = 0%, Poland = 0% additional/fully withheld at source).

**FR-HOLD-005**: Withholding Rate Override
The system shall allow the user to manually override the suggested withholding rate on any holding at any time.

**FR-HOLD-006**: US Withholding Default Without W-8BEN Confirmation
Where a US-domiciled holding's W-8BEN status is not explicitly confirmed by the user, the system shall default the suggested withholding rate to 30% rather than 15%.

### Dividend Detection & Notifications

**FR-DIV-001**: Upcoming Dividend Detection
When the daily market data sync finds a dividend record for a held ticker (declared, with a future ex-dividend or pay date) that has no corresponding dividend event yet, the system shall create an "upcoming" dividend event with the declared gross amount per share.

**FR-DIV-002**: Upcoming Dividend Notification
When an upcoming dividend event is created, the system shall notify the user via each channel (email and/or in-app) the user has enabled in their notification preferences, with the estimated gross amount and estimated PLN to set aside.

**FR-DIV-003**: Payout Confirmation Detection
When a dividend event's pay date has passed, the system shall finalize the dividend event (status moves from "upcoming" to "confirmed") and perform the tax calculation using that date.

**FR-DIV-004**: Payout Confirmation Notification
When a dividend event is finalized, the system shall notify the user via each channel (email and/or in-app) the user has enabled in their notification preferences, with the final PLN amount owed for tax set-aside.

**FR-NOTIF-001**: Notification Channel Preferences
The system shall allow each user to independently enable/disable email and in-app notifications, with at least one channel enabled by default.

**FR-NOTIF-002**: No Channels Enabled
Where a user has disabled all notification channels, the system shall still record the dividend event and surface it on the dashboard, but shall not attempt to send a notification.

### Tax Calculation

**FR-TAX-001**: FX Conversion
When calculating PLN values for a dividend event, the system shall convert the foreign currency gross amount using the official NBP average exchange rate published for the business day immediately preceding the pay date.

**FR-TAX-002**: Polish Tax Due Calculation
The system shall calculate Polish tax due on a dividend as 19% of the PLN-converted gross amount.

**FR-TAX-003**: Foreign Tax Credit Cap
The system shall calculate the creditable foreign withholding tax as the lesser of (a) the actual foreign tax withheld, converted to PLN, (b) the treaty-rate limit per FR-TAX-007, and (c) the Polish tax due calculated for that dividend (per FR-TAX-002) — per FR-TAX-004 excess foreign withholding above these limits is not creditable and is not carried forward.

**FR-TAX-004**: Amount to Set Aside
The system shall calculate the amount to set aside as (Polish tax due − creditable foreign tax credit), floored at zero.

**FR-TAX-005**: Fully-Withheld Domestic Dividends
Where a holding's domicile is Poland and the suggested/overridden withholding rate is set to "fully withheld at source," the system shall calculate the amount to set aside as zero.

**FR-TAX-006**: Per-Country Isolation
The system shall calculate the foreign tax credit independently per dividend event and shall not pool excess credit across different holdings or countries.

**FR-TAX-007**: Treaty-Rate Credit Limit
The system shall cap the creditable foreign tax at the domicile's double-tax-treaty rate (e.g., 15% for the US) regardless of the amount actually withheld at source — where a holding's actual withholding exceeds the treaty rate (e.g., 30% US withholding without W-8BEN on file), the excess above the treaty rate shall not be creditable in Poland even though it was genuinely withheld abroad.

### Dashboard

**FR-DASH-001**: Portfolio Overview
The system shall display all holdings with quantity, domicile, current suggested/overridden withholding rate, and total dividends received year-to-date.

**FR-DASH-002**: Year-to-Date Tax Summary
The system shall display a running total of the amount to set aside for Polish tax across all confirmed dividend events in the current tax year.

**FR-DASH-003**: Custom Visual Design
The dashboard and surrounding UI shall follow a deliberately designed, project-specific visual style (custom layout, typography, and color choices) rather than an unstyled or template-default look — this is a design/implementation concern to address during UI build, not a generated boilerplate pass.

## Non-Functional Requirements

### Performance
- Dividend/price data refresh: at least daily (aligned with free-tier market data API rate limits).
- Notification delivery: batched with the daily data refresh cycle rather than real-time/sub-hour, to minimize infrastructure cost — a delay of up to ~24 hours after detection/confirmation is acceptable.

### Security
- Passwords hashed with bcrypt or argon2; never stored/logged in plaintext.
- Sessions via JWT or equivalent, with email verification required before financial data access.
- Financial data (holdings, dividend history, tax estimates) treated as sensitive; encrypted at rest.
- No brokerage credentials are collected or stored (manual holdings entry + market data feed only).
- Session cookies (if used) shall be `httpOnly`, `secure`, and `sameSite`; state-changing requests shall be protected against CSRF.
- All traffic served over HTTPS; HSTS enabled.
- Security headers set on all responses: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options.
- Login, signup, and password-reset endpoints shall be rate-limited/backed off to mitigate brute-force and credential-stuffing attempts; signup/login errors shall not reveal whether an email is registered.
- All database queries shall use parameterized queries/ORM methods — no raw string-concatenated SQL.
- User-generated or third-party content rendered in the UI shall be escaped/sanitized to prevent XSS.
- Secrets (API keys, DB credentials) shall be stored in environment variables/secret manager, never committed to source control.
- Backups shall be encrypted at rest.
- Dependencies shall be scanned for known vulnerabilities on an ongoing basis (e.g., Dependabot/`npm audit` in CI).

### Cost & Scalability
- Architecture shall favor low fixed/idle cost (e.g., managed low-cost Postgres, serverless/edge hosting) over headroom for scale, given expected small initial user base.
- Market data integration shall start on a free-tier provider with a documented upgrade path to a paid tier without a data-model rewrite.

### Market Data Provider
- No mainstream free-tier stock API offers a forward-looking dividend-calendar endpoint on its free plan (confirmed for Financial Modeling Prep, Twelve Data, Finnhub — all gate this behind a paid plan).
- Chosen provider for launch: **Massive** (formerly Polygon.io), a licensed commercial provider — avoids the ToS/reliability exposure of unofficial scraping-based options. Using the free "Stocks Basic" plan: 5 requests/minute, 2 years of historical dividend/ticker data, dividends and ticker-overview endpoints both included.
- The free plan's 5 req/min limit is workable specifically because dividend/ticker data is deduplicated per unique ticker across all users (see `security_dividends` cache table) rather than fetched per user holding — a daily sync job rate-limited to 5 req/min can refresh hundreds of unique tickers well within one run.
- All calls shall go through a rate-limiting queue (default 5/min, configurable) so the app degrades gracefully rather than erroring when the user base's ticker count grows; upgrading to a paid Massive plan (unlimited requests, starting at $29/mo) is the scaling path once the free tier's throughput is insufficient.
- Known data gap: Massive's ticker overview endpoint returns `locale` (`us`/`global`) and a US-style street address (city/state, no country field) — it does **not** return company domicile/country directly. Domicile (FR-HOLD-002) is therefore approximated via a primary-exchange → country lookup table (e.g., XNAS/XNYS → USA, XLON → GBR), which is wrong for ADRs/foreign private issuers the same way every other provider's HQ-country field would be. The existing user override (FR-HOLD-005) remains the safety net for this case.
- All market data access shall go through a single internal abstraction (a `MarketDataProvider` interface) so switching plans or providers later is a contained change, not a rewrite.

### Extensibility (Future Monetization)
- The user/account schema shall include a plan/tier field (e.g., `free` by default) even though only one free tier exists at launch, so a paid tier can be introduced without a schema migration that touches existing records.
- Any place a limit could plausibly become tier-gated later (e.g., number of holdings tracked, notification frequency) shall be implemented as a configurable value per user/plan rather than a hardcoded constant.
- No specific paid-tier feature set or billing provider is chosen in this spec — only that the data model doesn't preclude adding one.

### Compliance
- The system shall display a disclaimer that tax estimates are not professional tax advice and may not reflect all treaty nuances.
- Tax-relevant records (holdings, dividend events, calculated amounts) shall be retained for at least 6 years, matching Polish tax documentation retention norms.
- As an EU/Poland-facing product handling financial PII, the system shall comply with GDPR: a published privacy policy, a documented lawful basis for processing, and user-facing data export and account/data deletion capabilities.

### SEO & Discoverability
- Public marketing/content pages (landing page, any guides/blog) shall be server-rendered or statically generated so content is crawlable without executing client-side JS.
- Authenticated app routes (dashboard, holdings, dividend events) shall be excluded from indexing (`noindex` meta/header) since they contain no content of public/search value.
- The site shall provide `sitemap.xml` and `robots.txt`, with public pages having proper `<title>`, meta description, and Open Graph tags.
- Public pages shall use semantic HTML heading structure and meet baseline Core Web Vitals targets (fast load, minimal layout shift).
- Content strategy: publish explanatory articles on Polish foreign-dividend tax rules (the domain this product already models) to target relevant organic search queries and drive acquisition.

## Acceptance Criteria

### AC-001: Add a Holding with Auto-Detected Domicile
Given a logged-in, verified user
When they add ticker "AAPL" with quantity 10
Then the holding is created with domicile "USA" and a suggested withholding rate of 30% (W-8BEN unconfirmed)
And the holding appears on their dashboard

### AC-002: Confirm W-8BEN Lowers Suggested Rate
Given a US-domiciled holding with W-8BEN unconfirmed
When the user marks W-8BEN as confirmed for that holding
Then the suggested withholding rate updates to 15%

### AC-003: Override Withholding Rate
Given any holding
When the user manually sets a custom withholding rate
Then subsequent tax calculations for that holding use the overridden rate instead of the suggested default

### AC-004: Upcoming US Dividend Notification
Given a user holds a US stock with an announced upcoming ex-dividend date, and has both email and in-app notifications enabled
When the market data feed reports the upcoming dividend
Then the user receives an email and in-app notification with the estimated PLN set-aside amount

### AC-004b: Notification Channel Preference Respected
Given a user has disabled email notifications and only has in-app enabled
When an upcoming or confirmed dividend event is created
Then the user receives only an in-app notification, no email is sent

### AC-005: US Dividend Tax Calculation with W-8BEN
Given a US holding with W-8BEN confirmed (15% foreign WHT) and a confirmed $100 gross dividend
When the payout is finalized using the NBP rate from the prior business day
Then Polish tax due is calculated as 19% of the PLN gross amount, the foreign tax credit is capped at 15%-equivalent PLN, and the amount to set aside equals the remaining ~4%

### AC-006: UK Dividend (0% WHT) Requires Full Polish Tax
Given a UK-domiciled holding with 0% foreign withholding
When a dividend payout is confirmed
Then the full 19% Polish tax on the PLN gross amount is calculated as the amount to set aside

### AC-007: Polish Domestic Dividend Requires No Set-Aside
Given a Poland-domiciled holding marked as fully withheld at source
When a dividend payout is confirmed
Then the amount to set aside is calculated as zero

### AC-008: Foreign WHT Exceeds Polish Tax Due
Given a holding where foreign withholding tax converted to PLN exceeds the calculated Polish tax due
When the payout is finalized
Then the amount to set aside is floored at zero and the excess foreign credit is not carried forward or applied elsewhere

### AC-009: Unsupported Ticker Rejected
Given a user attempting to add a holding
When they enter a ticker with no domicile/dividend data in the market feed
Then the system rejects the holding, displays a message that the ticker is not yet supported, and offers a "Request this ticker" action

### AC-010: Unverified Account Restricted
Given a user who has registered but not verified their email
When they log in and try to add a holding
Then they are blocked from the action and prompted to verify their email first

### AC-011: US Withholding Without W-8BEN Still Owes the Treaty-Rate Difference
Given a US holding without W-8BEN confirmed (30% actually withheld at source) and a confirmed $100 gross dividend
When the payout is finalized
Then the foreign tax credit is capped at the 15% treaty rate (not the full 30% withheld), and the amount to set aside is the same ~4% as if W-8BEN had been on file — the extra 15% over-withholding is not creditable in Poland and must be reclaimed from the IRS directly

## Error Handling

| Error Condition | HTTP Code | User Message |
|-----------------|-----------|---------------|
| Invalid/unsupported ticker | 400 | "This ticker isn't supported yet — request it and we'll take a look" |
| Missing required holding fields | 400 | "Ticker and quantity are required" |
| Unverified account action | 403 | "Please verify your email to continue" |
| Unauthorized | 401 | "Please log in to continue" |
| Duplicate registration email | 409 | "An account with this email already exists" |
| Market data feed unavailable | 503 | "Dividend data is temporarily unavailable, please try again later" |
| NBP FX rate unavailable for date | 502 | "Exchange rate data is temporarily unavailable for this payout date" |

## Implementation TODO

### Backend
- [x] User/account schema (incl. `plan`/tier field defaulting to `free`) + email verification flow
- [x] OAuth provider integration (e.g., Google)
- [x] Notification preferences table (per-user email/in-app toggles, default at least one on — created via the `handle_new_user` trigger alongside `profiles`)
- [x] Holdings table (ticker, quantity, avg price, domicile, withholding rate, override flag)
- [x] Reference dataset/service for ticker → domicile mapping (exchange-heuristic based, see Market Data Provider NFR)
- [x] Ticker support request flow (capture ticker + user via `requestTickerSupport` server action)
- [x] `MarketDataProvider` interface + Massive-backed implementation (ticker overview, dividend history) — see Market Data Provider NFR
- [x] Rate-limiting queue for Massive API calls (5 req/min default, configurable)
- [x] Shared `security_dividends` cache table + daily sync job (dedupe per unique ticker, not per holding)
- [x] Exchange → country heuristic table for domicile approximation (Massive has no country field)
- [x] NBP FX rate integration (average rate, day-before-payout lookup)
- [x] Dividend event model (upcoming/confirmed states, gross amount, WHT, FX rate used)
- [x] Tax calculation service (FR-TAX-001 through FR-TAX-007, incl. treaty-rate credit cap)
- [x] Scheduled job: poll market data feed daily for upcoming/confirmed dividends (`/api/cron/sync-dividends`, `vercel.json`), creating in-app notifications inline as events are created/finalized
- [x] Notification service — **in-app only** (decided scope: no email/Resend for now). New `notifications` table (one row per dividend_event × upcoming/confirmed transition, since one event can notify twice over its lifetime); `createNotificationIfEnabled` respects `notification_preferences.in_app_enabled` (FR-NOTIF-002: event is always recorded, notification is skipped if disabled). Email sending remains unbuilt.
- [x] Dividend events list + dashboard summary (queried directly in `/dashboard`, no separate REST endpoint) and notification preferences (server action, no REST endpoint — holdings follow the same pattern)
- [x] Rate limiting on auth endpoints — covered by Supabase's own built-in auth rate limiting (token-bucket, ~30 request capacity per IP, configurable in the Supabase dashboard); we don't proxy login/signup through our own server, the browser calls Supabase directly, so there's no app-level endpoint of ours to add redundant limiting to
- [x] Security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) applied to all responses via `next.config.ts` `headers()`
- [x] Dependency vulnerability scanning wired into CI (`.github/workflows/ci.yml`: `npm audit --audit-level=high` on every push/PR to main, alongside lint/typecheck/vitest/build)
- [x] Privacy policy (`/privacy`, draft — grounded in real data practices but explicitly flagged as needing real legal review, not yet done) + GDPR data export/deletion (`exportMyData`/`deleteMyAccount` server actions in `/dashboard/settings`, both scoped to the caller's own session — export relies on RLS, deletion uses the service role to remove the auth user, which cascades through profiles → holdings → transactions/dividend_events/notifications)
- [x] `sitemap.xml` + `robots.txt`, with authenticated routes marked `noindex`

### Frontend
- [x] Signup/login/OAuth UI + email verification prompt
- [x] Add/edit holding form (ticker, quantity, avg price, W-8BEN confirmation toggle for US holdings) — edit not yet implemented, add only
- [x] "Request this ticker" flow for unsupported tickers
- [x] Notification preferences UI (`/dashboard/settings`, toggle email/in-app)
- [x] Withholding rate display + override control per holding (`/dashboard/holdings/[id]` — `HoldingSettingsForm` shows the suggested rate and lets the user set/clear an override; built during Phase 2 of the lot-tracking rework)
- [x] Dashboard: holdings list, YTD received/set-aside summary cards, recent dividend activity list — all backed by real data, custom-designed layout/visual style applied (dark theme, emerald accent, proper grid with column headers — see FR-DASH-003); landing/login/signup/settings carry the same visual language, plus a shared authenticated nav header (Holdings/Settings/Log out)
- [x] Notification center (in-app): bell icon in the dashboard header with an unread-count badge, dropdown listing recent notifications (ticker, type, amounts, pay date), mark-one/mark-all-read
- [x] Tax Years view (`/dashboard/tax-years`): year selector, per-year received/set-aside totals, per-holding breakdown, full confirmed-payout table — a filtered browse of `dividend_events`, no snapshot mechanism (confirmed events are already immutable once calculated)
- [x] Disclaimer banner (not tax advice) — persistent slim bar under the header on every `/dashboard/*` page

### Testing
- [x] Unit tests for tax calculation service (all AC-005 through AC-008 and AC-011 scenarios)
- [x] Unit tests for FX conversion date logic (weekends/holidays before payout)
- [x] Manual E2E smoke test (ad-hoc Playwright script, not committed): signup → login → dashboard verification gate → add holding (AAPL) → cron sync → 56 real dividend events created with correct NBP FX rates and tax calculations. Surfaced two real bugs, both fixed via migrations `0004_grants.sql` (missing base table GRANTs for anon/authenticated/service_role — RLS policies narrow access but don't grant it) and `0005_profile_on_signup.sql` (nothing created the `profiles` row `holdings` depends on; added an `auth.users` trigger + backfill).
- [x] E2E test suite (committed, automated, Playwright — `e2e/`, run via `npm run test:e2e`): auth (signup/login/logout/dashboard gate), holdings (add/duplicate/unsupported-ticker+request/sell-validation/delete-cascade), RLS isolation (cross-user access blocked), and tax-calculation regressions (treaty-rate cap, acquisition-date filtering) — 13 tests, all passing against live Supabase + Massive
- [x] Manual verification of the in-app notification service: bell badge count, dropdown content, mark-one-read (badge decrements and persists across reload), mark-all-read (badge clears) — all confirmed against live data
- [x] Automated E2E test for the notification flow (`e2e/notifications.spec.ts`): add holding → sync creates notification rows (unread) → dropdown shows them → mark read persists in the DB — 14 E2E tests total now

## Out of Scope
- Broker account/API sync or CSV statement import
- Itemized per-transaction lot tracking (only aggregate quantity + avg price for MVP)
- PIT-38 (or other) form generation/filing
- Mobile app (web only for MVP)
- Non-Polish tax residency support
- Actual billing/payment processing and paid-tier feature set (schema should merely not block adding this later — see Extensibility NFR)
- Push notifications (email + in-app only for MVP)
- Carrying forward excess foreign tax credit across years or countries

## Open Questions
- [x] Which specific free-tier market data provider to use? Resolved: Massive (formerly Polygon.io), Stocks Basic free plan — see Market Data Provider NFR for rationale and accepted limitations.
- [x] Does the NBP API provide sufficient historical coverage and uptime guarantees? Resolved empirically: real sync runs have successfully resolved rates back to 2004 with no gaps encountered; `nbp_rates` (migration 0009) caches every resolved rate permanently, which also acts as the fallback if NBP is ever briefly unavailable for a date already seen.
- [ ] Should the default withholding-rate reference table be seeded with a fixed list of countries at launch (e.g., US, UK, Germany, Ireland-domiciled ETFs), and who maintains it as treaties change?
- [ ] Exact legal wording for the "not tax advice" disclaimer — may need review beyond this spec.
