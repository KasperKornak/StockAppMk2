import { cookies } from "next/headers";
import Link from "next/link";

const copy = {
  pl: { title: "Nie znaleziono strony", backHome: "Strona główna" },
  en: { title: "Page not found", backHome: "Home" },
};

// Root-level fallback for URLs that don't resolve to any locale segment at
// all (e.g. a stray/misconfigured redirect). Can't use next-intl's routing
// here since nothing matched, but a NEXT_LOCALE cookie is set as soon as a
// visitor has used the language switcher anywhere on the site — read that
// directly instead of showing both languages.
export default async function RootNotFound() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value === "en" ? "en" : "pl";
  const t = copy[locale];

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="text-6xl font-bold tracking-tight text-emerald-400">404</div>
      <h1 className="text-xl font-semibold text-neutral-50">{t.title}</h1>
      <Link
        href="/"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
      >
        {t.backHome}
      </Link>
    </div>
  );
}
