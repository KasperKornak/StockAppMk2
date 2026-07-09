const options = [
  {
    href: "/design-preview/minimal",
    title: "Clean minimal fintech",
    description: "Generous whitespace, restrained color, thin borders instead of shadows.",
  },
  {
    href: "/design-preview/dense",
    title: "Data-dense professional",
    description: "Tighter grid, tabular numbers, optimized for scanning many rows.",
  },
  {
    href: "/design-preview/warm",
    title: "Warm & approachable",
    description: "Rounder corners, card-based layout, friendlier tone.",
  },
];

export default function DesignPreviewIndex() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-24">
      <h1 className="text-2xl font-semibold">Design direction preview</h1>
      <p className="text-neutral-400">
        Same mock portfolio, three visual treatments. Pick one and it becomes the real dashboard.
      </p>
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <a
            key={option.href}
            href={option.href}
            className="rounded-lg border border-neutral-800 p-4 transition-colors hover:border-emerald-500/50 hover:bg-neutral-900"
          >
            <div className="font-medium">{option.title}</div>
            <div className="text-sm text-neutral-400">{option.description}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
