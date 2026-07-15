import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware drop-ins for next/link, next/navigation's router/pathname,
// and redirect() — use these instead of the next/* versions anywhere inside
// src/app/[locale] so navigation preserves the current locale automatically.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
