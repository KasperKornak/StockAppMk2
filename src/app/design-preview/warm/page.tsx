import { formatPln, formatRate, mockHoldings, mockYtdSummary } from "../mock-data";

export default function WarmPreview() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <span className="text-lg font-semibold">🌱 Dividend Tax Tracker</span>
        <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-emerald-400">
          + Add holding
        </button>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-neutral-900 p-5 shadow-lg shadow-black/20">
          <div className="text-sm text-neutral-400">You&apos;ve received</div>
          <div className="mt-1 text-2xl font-semibold">
            {formatPln(mockYtdSummary.totalReceivedPln)}
          </div>
          <div className="text-xs text-neutral-500">this year, across all holdings</div>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 p-5 shadow-lg shadow-black/20">
          <div className="text-sm text-emerald-300">Set aside for tax</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-400">
            {formatPln(mockYtdSummary.totalSetAsidePln)}
          </div>
          <div className="text-xs text-emerald-300/70">so tax time has no surprises</div>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-medium text-neutral-400">Your holdings</h2>
      <div className="flex flex-col gap-3">
        {mockHoldings.map((holding) => (
          <div
            key={holding.ticker}
            className="flex items-center justify-between rounded-2xl bg-neutral-900 p-4 shadow-md shadow-black/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold">
                {holding.ticker.slice(0, 2)}
              </div>
              <div>
                <div className="font-medium">{holding.ticker}</div>
                <div className="text-xs text-neutral-500">
                  {holding.name} · {holding.domicile}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatPln(holding.ytdReceivedPln)}</div>
              <div className="text-xs text-neutral-500">
                {holding.quantity} sh · {formatRate(holding.suggestedRate)} withheld
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
