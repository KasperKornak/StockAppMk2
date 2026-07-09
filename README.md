# Dividend Tax Tracker

Tracks dividend-paying holdings for Polish tax residents and calculates how
much PLN to set aside for tax on each payout. Full requirements live in
[specs/dividend-tax-tracker.spec.md](specs/dividend-tax-tracker.spec.md).

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Supabase (Postgres + Auth + Row Level Security)
- Vitest for unit tests

## Setup

1. Copy `.env.example` to `.env.local` and fill in your Supabase project URL/anon key.
2. Create a Supabase project and run the migration in `supabase/migrations/0001_init.sql`
   (via the Supabase SQL editor or `supabase db push` with the Supabase CLI).
3. Enable the Google OAuth provider in Supabase Auth settings if you want
   social login (FR-AUTH-003).
4. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm test` — run unit tests (tax calculation logic)
- `npm run lint` — lint

## Status

This is an early scaffold: auth, schema (with RLS), the tax calculation
engine, and route structure are in place. Market data integration, dividend
notifications, and the full dashboard UI are not yet implemented — see the
Implementation TODO checklist in the spec.
