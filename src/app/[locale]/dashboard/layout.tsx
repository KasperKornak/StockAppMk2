import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { FeedbackButton } from "@/components/feedback-form";
import { redirect } from "@/i18n/navigation";
import { fetchRecentNotifications } from "@/lib/notifications/fetch";
import { createClient } from "@/lib/supabase/server";

// FR-DASH: authenticated app routes carry no public/search value.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  // Independent reads — notifications are scoped by the session cookie via
  // RLS, not by the `user` object below, so they don't need to wait on it.
  const [
    {
      data: { user },
    },
    notifications,
  ] = await Promise.all([supabase.auth.getUser(), fetchRecentNotifications(supabase)]);

  // proxy.ts already redirects unauthenticated requests, but Server
  // Components can't rely on that alone (see Supabase Next.js auth guide).
  if (!user) {
    redirect({ href: "/login", locale: await getLocale() });
  }
  // next-intl's redirect() is typed `=> never`, but its conditional-heavy
  // signature defeats TS's control-flow narrowing here — assert explicitly.
  const currentUser = user!;

  const t = await getTranslations("DashboardLayout");
  const tFooter = await getTranslations("SiteFooter");

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader userEmail={currentUser.email ?? ""} notifications={notifications} />

      <div className="border-b border-neutral-900 bg-neutral-900/40 px-6 py-1.5 text-center text-xs text-neutral-500">
        {t("disclaimer")}
      </div>

      {/* FR-AUTH-002: unverified accounts can reach /dashboard but not the
          holding/dividend features it contains. */}
      {!currentUser.email_confirmed_at ? (
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <h1 className="text-xl font-semibold text-neutral-50">{t("verifyEmailTitle")}</h1>
          <p className="text-neutral-400">{t("verifyEmailBody", { email: currentUser.email ?? "" })}</p>
        </div>
      ) : (
        children
      )}

      <footer className="border-t border-neutral-900 px-6 py-6 text-center text-xs text-neutral-600">
        <FeedbackButton defaultEmail={currentUser.email ?? undefined} className="underline hover:text-neutral-400" />
        <span className="mx-2">·</span>
        {tFooter("madeIn")}
      </footer>
    </div>
  );
}
