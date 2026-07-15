"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className={className ?? "flex items-center gap-1 text-sm text-neutral-500"}>
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-700">/</span>}
          <Link
            href={pathname}
            locale={l}
            aria-current={l === locale ? "true" : undefined}
            className={
              l === locale
                ? "text-neutral-100"
                : "text-neutral-500 transition-colors hover:text-neutral-300"
            }
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
