# Roadmap

Last updated: 2026-07-29. Status snapshot of what's shipped vs. planned — informs the "coming soon" UI flags and general prioritization. Not a commitment or timeline, just a shared picture of where things stand.

## Shipped (in production)

- Holdings tracking with full lot accounting (buy/sell transactions, quantity-as-of-date)
- Automatic dividend detection via daily sync (Massive API)
- Belka tax calculation: 19% flat rate, foreign tax credit capped at the lesser of actual withholding / treaty rate / Polish tax due
- W-8BEN status + per-holding withholding-rate override
- NBP FX rate integration with permanent caching
- Dividend lifecycle status: upcoming → qualified (ex-date passed) → paid out
- Tax-year breakdown view
- In-app notifications (upcoming + confirmed dividends)
- GDPR data export (human-readable format) + account deletion
- Soft-delete for holdings — removing one keeps its transaction/dividend history
- Email/password + Google OAuth login
- Cloudflare Turnstile bot protection on login/signup
- In-app feedback/contact form (honeypot + rate-limited)
- Ticker autocomplete (static curated list, no per-keystroke API calls) — extended so a ticker found in that list also skips the Massive validation call entirely (domicile/currency hardcoded to match what Massive would return anyway)
- English/Polish i18n, Polish as default
- Custom 404/error pages
- Locale-aware `robots.ts`/`sitemap.ts` with hreflang alternates, Open Graph/Twitter card metadata
- Per-page hreflang `<link>` tags (landing, privacy, blog index, blog post)
- Blog with one article: "Dividend Investing and Belka Tax: A Guide for Polish Investors" (`/blog/dividend-investing-belka-tax`), linked from the public header nav
- Security review (no high/medium findings)

## Planned, not yet built

- **Bilingual `/help` page** — content is written (tax calc, statuses, W-8BEN, ticker requests, notifications, tax years, data rights) but not polished; owner wants to finish it themselves before it goes live. Currently gated behind `HELP_PAGE_PUBLISHED = false` in `help/page.tsx` (shows a "coming soon" placeholder, `noindex`, nav/footer links disabled) — flip that flag plus re-add the nav/footer links once ready.
- **Email notifications** — the Settings toggle exists today but does nothing (only in-app notifications actually fire). Assessed cheap options (Resend free tier vs. Brevo) — owner to pick and create an account before this can be wired up. → gets a "coming soon" tag now that it's misleading as-is.
- **Feedback delivery alert** — new feedback currently only shows up by manually checking the `feedback` table in Supabase. Owner wants a push notification (Discord/Slack webhook, or folded into the Resend work above for email) — deferred for now, revisit later.
- **More blog content** — one article live; owner may want more over time (e.g. W-8BEN deep dive, PIT-38 walkthrough).
- **Broker CSV/statement import** — manual transaction entry only, for now.
- **Mobile app** — web-only currently; not scoped.
- **Lot-accounting refinements** — e.g. FIFO/average-cost method choice, currently always average-cost.
- **Google OAuth production verification** — still in Google Cloud Console "Testing" mode (100-user cap, 7-day token expiry). At 19 total users, nowhere near the cap — revisit if/when growth approaches it.
- **Legal review of the Privacy Policy** — drafted, grounded in what the app actually does, not lawyer-reviewed. Owner explicitly deferring this for now.

## Open questions (no decision needed yet, just tracked)

- Who maintains the `domicile_tax_rules` table long-term as new countries/holdings appear — currently informal (flagged to the owner as needed).
- Whether/when to pursue a full security test suite across all integrated services (Supabase, Massive, NBP, Turnstile, Vercel, Cron) beyond the initial security-review pass already completed.
- Whether/when to build a comprehensive manual QA checklist (specific inputs → expected outputs) for hand-verification, and a dedicated test user separate from the owner's real account.
