import { formatPln, formatRate, mockHoldings, mockYtdSummary } from "../mock-data";

const columns = "1.4fr 0.8fr 0.7fr 0.7fr 1fr";

export default function MinimalPreview() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl px-6 py-16">
        <header className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs font-bold text-neutral-950">
              D
            </div>
            <span className="font-medium tracking-tight text-neutral-100">
              Dividend Tax Tracker
            </span>
          </div>
          <nav className="flex gap-6 text-sm">
            <span className="relative text-neutral-100">
              Holdings
              <span className="absolute -bottom-4 left-0 h-px w-full bg-emerald-400" />
            </span>
            <span className="text-neutral-500 transition-colors hover:text-neutral-300">
              Settings
            </span>
          </nav>
        </header>

        <div className="mb-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-800/80">
          <div className="bg-neutral-950 p-6">
            <div className="text-xs font-medium tracking-wider text-neutral-500 uppercase">
              Received this year
            </div>
            <div className="mt-2.5 text-3xl font-semibold tracking-tight tabular-nums text-neutral-50">
              {formatPln(mockYtdSummary.totalReceivedPln)}
            </div>
          </div>
          <div className="bg-neutral-950 p-6">
            <div className="text-xs font-medium tracking-wider text-emerald-400/80 uppercase">
              Set aside for tax
            </div>
            <div className="mt-2.5 text-3xl font-semibold tracking-tight tabular-nums text-emerald-400">
              {formatPln(mockYtdSummary.totalSetAsidePln)}
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-300">Holdings</h2>
          <button className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-neutral-100 transition-colors hover:border-emerald-500/50 hover:text-emerald-400">
            + Add holding
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-800">
          <div
            className="grid gap-4 border-b border-neutral-800 bg-neutral-900/60 px-5 py-2.5 text-xs font-medium tracking-wider text-neutral-500 uppercase"
            style={{ gridTemplateColumns: columns }}
          >
            <span>Ticker</span>
            <span>Domicile</span>
            <span className="text-right">Qty</span>
            <span className="text-right">WHT</span>
            <span className="text-right">YTD received</span>
          </div>

          {mockHoldings.map((holding, i) => (
            <div
              key={holding.ticker}
              style={{ gridTemplateColumns: columns }}
              className={`grid items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-900/40 ${
                i !== mockHoldings.length - 1 ? "border-b border-neutral-800/70" : ""
              }`}
            >
              <div>
                <div className="font-medium text-neutral-100">{holding.ticker}</div>
                <div className="text-xs text-neutral-500">{holding.name}</div>
              </div>
              <div className="text-sm text-neutral-400">{holding.domicile}</div>
              <div className="text-right text-sm tabular-nums text-neutral-400">
                {holding.quantity}
              </div>
              <div className="text-right text-sm tabular-nums text-neutral-400">
                {formatRate(holding.suggestedRate)}
              </div>
              <div className="text-right font-medium tabular-nums text-neutral-100">
                {formatPln(holding.ytdReceivedPln)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
