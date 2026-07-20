import Link from "next/link";

// Root-level fallback for URLs that don't resolve to any locale segment at
// all (e.g. a stray/misconfigured redirect) — can't reliably know the
// visitor's locale here, so this shows both languages, kept minimal.
export default function RootNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="text-6xl" aria-hidden>
        🧭
      </div>
      <h1 className="text-xl font-semibold text-neutral-50">
        404 · Nie znaleziono / Not found
      </h1>
      <Link
        href="/"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
      >
        Strona główna / Home
      </Link>
    </div>
  );
}
