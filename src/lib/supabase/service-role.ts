import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for server-to-server jobs (e.g. the dividend sync
 * cron) that need to read/write across all users' data. Bypasses Row Level
 * Security — never expose this key to the client, never use it in a
 * request handler that serves a single user's data.
 */
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
