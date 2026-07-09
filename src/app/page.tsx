import { SiteHeader } from "@/components/site-header";

const steps = [
  {
    number: "01",
    title: "Add your holdings",
    description: "Ticker and quantity — we look up the domicile and default withholding rate for you.",
  },
  {
    number: "02",
    title: "We track every payout",
    description:
      "Upcoming and confirmed dividends detected automatically, converted at the official NBP rate.",
  },
  {
    number: "03",
    title: "Know what to set aside",
    description:
      "See the exact PLN owed after foreign tax credits — before it's time to file.",
  },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <SiteHeader />

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-24">
        <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
          For Polish dividend investors
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
          Know exactly how much tax to set aside on every dividend.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-neutral-400">
          Add your holdings, and get notified before and after every payout with
          the exact PLN amount owed after foreign withholding tax credits —
          calculated using the official NBP exchange rate.
        </p>
        <div className="flex gap-3">
          <a
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-6 text-base font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            Get started
          </a>
          <a
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full border border-neutral-700 px-6 text-base font-medium text-neutral-100 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
          >
            Log in
          </a>
        </div>
      </main>

      <section id="how-it-works" className="relative border-t border-neutral-900 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-sm font-medium tracking-wider text-neutral-500 uppercase">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number}>
                <div className="mb-3 font-mono text-sm text-emerald-400">{step.number}</div>
                <h3 className="mb-2 font-medium text-neutral-100">{step.title}</h3>
                <p className="text-sm leading-6 text-neutral-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative border-t border-neutral-900 px-6 py-8">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 text-sm text-neutral-500">
          <span>Dividend Tax Tracker</span>
          <span>Not tax advice — always verify with a professional.</span>
          <a href="/privacy" className="underline hover:text-neutral-300">
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
}
