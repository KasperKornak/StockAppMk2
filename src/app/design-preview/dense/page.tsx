import { formatPln, formatRate, mockHoldings, mockYtdSummary } from "../mock-data";

export default function DensePreview() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 font-mono text-sm">
      <header className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
        <span className="font-semibold text-neutral-100">DIVIDEND-TAX-TRACKER</span>
        <div className="flex gap-4 text-neutral-500">
          <span className="text-emerald-400">HOLDINGS</span>
          <span>SETTINGS</span>
        </div>
      </header>

      <div className="mb-4 flex gap-4 border border-neutral-800 bg-neutral-900/50 p-3">
        <div className="flex-1 border-r border-neutral-800 pr-4">
          <div className="text-neutral-500">RECEIVED YTD</div>
          <div className="text-lg tabular-nums text-neutral-100">
            {formatPln(mockYtdSummary.totalReceivedPln)}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-neutral-500">SET ASIDE YTD</div>
          <div className="text-lg tabular-nums text-emerald-400">
            {formatPln(mockYtdSummary.totalSetAsidePln)}
          </div>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 text-left text-neutral-500">
            <th className="py-1.5 font-normal">TICKER</th>
            <th className="py-1.5 font-normal">DOMICILE</th>
            <th className="py-1.5 text-right font-normal">QTY</th>
            <th className="py-1.5 text-right font-normal">AVG PRICE</th>
            <th className="py-1.5 text-right font-normal">WHT</th>
            <th className="py-1.5 text-right font-normal">YTD PLN</th>
          </tr>
        </thead>
        <tbody>
          {mockHoldings.map((holding, i) => (
            <tr
              key={holding.ticker}
              className={`border-b border-neutral-900 ${i % 2 === 1 ? "bg-neutral-900/30" : ""}`}
            >
              <td className="py-1.5 text-neutral-100">{holding.ticker}</td>
              <td className="py-1.5 text-neutral-500">{holding.domicile}</td>
              <td className="py-1.5 text-right tabular-nums">{holding.quantity}</td>
              <td className="py-1.5 text-right tabular-nums text-neutral-400">
                {holding.avgPrice.toFixed(2)} {holding.currency}
              </td>
              <td className="py-1.5 text-right tabular-nums text-neutral-400">
                {formatRate(holding.suggestedRate)}
              </td>
              <td className="py-1.5 text-right tabular-nums text-neutral-100">
                {formatPln(holding.ytdReceivedPln)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="mt-4 border border-neutral-800 px-3 py-1.5 text-emerald-400 hover:bg-neutral-900">
        + ADD HOLDING
      </button>
    </div>
  );
}
