# Roadmap

Last updated: 2026-07-20. Status snapshot of what's shipped vs. planned — informs the "coming soon" UI flags and general prioritization. Not a commitment or timeline, just a shared picture of where things stand.

## Shipped (in production)

- Holdings tracking with full lot accounting (buy/sell transactions, quantity-as-of-date)
- Automatic dividend detection via daily sync (Massive API)
- Belka tax calculation: 19% flat rate, foreign tax credit capped at the lesser of actual withholding / treaty rate / Polish tax due
- W-8BEN status + per-holding withholding-rate override
- NBP FX rate integration with permanent caching
- Dividend lifecycle status: upcoming → qualified (ex-date passed) → confirmed (paid)
- Tax-year breakdown view
- In-app notifications (upcoming + confirmed dividends)
- GDPR data export + account deletion
- Email/password + Google OAuth login
- Cloudflare Turnstile bot protection on login/signup
- In-app feedback/contact form
- English/Polish i18n, Polish as default
- Custom 404/error pages
- Security review (no high/medium findings)

## Planned, not yet built

- **Email notifications** — the Settings toggle exists today but does nothing (only in-app notifications actually fire). Needs Resend wired up. → gets a "coming soon" tag now that it's misleading as-is.
- **Broker CSV/statement import** — manual transaction entry only, for now.
- **Mobile app** — web-only currently; not scoped.
- **Lot-accounting refinements** — e.g. FIFO/average-cost method choice, currently always average-cost.
- **SEO content** (articles, structured content) — deliberately deferred past initial launch.
- **Google OAuth production verification** — still in Google Cloud Console "Testing" mode (100-user cap, 7-day token expiry). Fine for beta; needs Google's verification process for public scale.
- **Locale-aware `robots.ts`/`sitemap.ts`** — currently point at default-locale URLs only; minor SEO gap.
- **Legal review of the Privacy Policy** — drafted, grounded in what the app actually does, not lawyer-reviewed.
- **Real business identity in the Privacy Policy** — `[YOUR NAME]` placeholder, deliberately left until a name/company decision is made.

## Open questions (no decision needed yet, just tracked)

- Who maintains the `domicile_tax_rules` table long-term as new countries/holdings appear — currently informal (flagged to the owner as needed).
- Whether/when to pursue a full security test suite across all integrated services (Supabase, Massive, NBP, Turnstile, Vercel, Cron) beyond the initial security-review pass already completed.
- Whether/when to build a comprehensive manual QA checklist (specific inputs → expected outputs) for hand-verification, and a dedicated test user separate from the owner's real account.
