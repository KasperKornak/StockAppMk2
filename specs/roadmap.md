# Roadmap

Last updated: 2026-07-24. Status snapshot of what's shipped vs. planned — informs the "coming soon" UI flags and general prioritization. Not a commitment or timeline, just a shared picture of where things stand.

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
- Ticker autocomplete (static curated list, no per-keystroke API calls)
- English/Polish i18n, Polish as default
- Bilingual `/help` page
- Custom 404/error pages
- Locale-aware `robots.ts`/`sitemap.ts` with hreflang alternates, Open Graph/Twitter card metadata
- Security review (no high/medium findings)

## Planned, not yet built

- **Email notifications** — the Settings toggle exists today but does nothing (only in-app notifications actually fire). Needs Resend wired up. → gets a "coming soon" tag now that it's misleading as-is.
- **Feedback delivery alert** — new feedback currently only shows up by manually checking the `feedback` table in Supabase. Owner wants a push notification (Discord/Slack webhook, or folded into the Resend work above for email) — deferred for now, revisit later.
- **Broker CSV/statement import** — manual transaction entry only, for now.
- **Mobile app** — web-only currently; not scoped.
- **Lot-accounting refinements** — e.g. FIFO/average-cost method choice, currently always average-cost.
- **SEO content** (articles, structured content) — technical SEO (sitemap/robots/OG/hreflang) is done; long-form content (e.g. an article on dividend investing + Belka tax) not started yet.
- **Google OAuth production verification** — still in Google Cloud Console "Testing" mode (100-user cap, 7-day token expiry). Fine for beta; needs Google's verification process for public scale.
- **Legal review of the Privacy Policy** — drafted, grounded in what the app actually does, not lawyer-reviewed.
- **Per-page hreflang `<link>` tags** — the sitemap already has correct alternates; page-level `<link rel="alternate">` tags would need the current pathname threaded into `generateMetadata`, not done yet.

## Open questions (no decision needed yet, just tracked)

- Who maintains the `domicile_tax_rules` table long-term as new countries/holdings appear — currently informal (flagged to the owner as needed).
- Whether/when to pursue a full security test suite across all integrated services (Supabase, Massive, NBP, Turnstile, Vercel, Cron) beyond the initial security-review pass already completed.
- Whether/when to build a comprehensive manual QA checklist (specific inputs → expected outputs) for hand-verification, and a dedicated test user separate from the owner's real account.
