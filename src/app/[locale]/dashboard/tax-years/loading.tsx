export default function TaxYearsLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 animate-pulse px-6 py-12">
      <div className="mb-5 h-4 w-24 rounded bg-neutral-800" />
      <div className="mb-8 flex gap-2">
        <div className="h-8 w-16 rounded-full bg-neutral-800" />
        <div className="h-8 w-16 rounded-full bg-neutral-800" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-800/80">
        <div className="h-24 bg-neutral-950" />
        <div className="h-24 bg-neutral-950" />
      </div>
      <div className="h-56 rounded-xl border border-neutral-800 bg-neutral-900/40" />
    </div>
  );
}
