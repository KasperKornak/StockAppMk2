import { SiteHeader } from "@/components/site-header";

// DRAFT — grounded in what this app actually does (see specs/dividend-tax-tracker.spec.md
// Compliance NFR + Open Questions), but not reviewed by a lawyer. Replace the
// bracketed placeholders and get real legal review before relying on this.
export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-neutral-300">
        <h1 className="mb-2 text-2xl font-semibold text-neutral-50">Privacy Policy</h1>
        <p className="mb-8 text-sm text-neutral-500">
          Draft — last updated [DATE]. This has not yet been reviewed by a lawyer.
        </p>

        <div className="space-y-6 text-sm leading-6">
          <section>
            <h2 className="mb-2 font-medium text-neutral-100">What we collect</h2>
            <p>
              Your email address (and, if you sign in with Google, the basic profile info Google
              shares); the holdings, transactions, and tickers you enter; and the dividend and tax
              figures we calculate from that data using public market and exchange-rate sources.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">Who else sees it</h2>
            <p>
              <strong className="text-neutral-100">Supabase</strong> hosts our database and
              handles authentication — it processes your account and holdings data on our behalf.{" "}
              <strong className="text-neutral-100">Massive</strong> (market data) receives the
              ticker symbols you track, not your identity. <strong className="text-neutral-100">
                NBP
              </strong>{" "}
              (Polish National Bank, exchange rates) receives no personal data at all — those
              lookups don&apos;t reference you or your holdings.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">How long we keep it</h2>
            <p>
              Until you delete your account. Tax-relevant records are worth keeping for at least 6
              years to match typical Polish tax documentation retention norms, but that&apos;s your
              call, not something we enforce.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">Your rights</h2>
            <p>
              You can export everything we store about you, or permanently delete your account and
              all associated data, at any time from{" "}
              <a href="/dashboard/settings" className="text-emerald-400 underline hover:text-emerald-300">
                Settings
              </a>
              . You can correct or remove individual holdings yourself from the dashboard.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">Not tax advice</h2>
            <p>
              Everything this app calculates is an estimate to help you plan — it is not
              professional tax advice and may not reflect every treaty nuance. Verify with a
              qualified professional before filing.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-neutral-100">Contact</h2>
            <p>Questions about your data: [CONTACT EMAIL].</p>
          </section>
        </div>
      </div>
    </div>
  );
}
