import Link from "next/link";

// Root-level fallback for URLs that don't resolve to any locale segment at
// all (e.g. a stray/misconfigured redirect) — can't reliably know the
// visitor's locale here, so this shows both languages rather than guessing.
export default function RootNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-neutral-50">
        Nie znaleziono strony / Page not found
      </h1>
      <p className="text-neutral-400">
        Strona, której szukasz, nie istnieje lub została przeniesiona.
        <br />
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
      >
        Wróć na stronę główną / Back to home
      </Link>
    </div>
  );
}
