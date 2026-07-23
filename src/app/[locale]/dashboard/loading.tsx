export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 animate-pulse px-6 py-12">
      <div className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-800/80">
        <div className="h-24 bg-neutral-950" />
        <div className="h-24 bg-neutral-950" />
      </div>
      <div className="mb-5 h-4 w-20 rounded bg-neutral-800" />
      <div className="h-40 rounded-xl border border-neutral-800 bg-neutral-900/40" />
      <div className="mt-10 mb-5 h-4 w-40 rounded bg-neutral-800" />
      <div className="h-56 rounded-xl border border-neutral-800 bg-neutral-900/40" />
    </div>
  );
}
