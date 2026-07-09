import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts already redirects unauthenticated requests, but Server
  // Components can't rely on that alone (see Supabase Next.js auth guide).
  if (!user) {
    redirect("/login");
  }

  const notifications = await fetchRecentNotifications(supabase);

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader userEmail={user.email ?? ""} notifications={notifications} />

      <div className="border-b border-neutral-900 bg-neutral-900/40 px-6 py-1.5 text-center text-xs text-neutral-500">
        Estimates only, not tax advice — verify with a professional before filing.
      </div>

      {/* FR-AUTH-002: unverified accounts can reach /dashboard but not the
          holding/dividend features it contains. */}
      {!user.email_confirmed_at ? (
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <h1 className="text-xl font-semibold text-neutral-50">Verify your email to continue</h1>
          <p className="text-neutral-400">
            We sent a verification link to {user.email}. Confirm it to unlock
            your holdings and dividend tracking.
          </p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
