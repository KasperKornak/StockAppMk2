import { NextResponse } from "next/server";
import { syncDividendsForAllHoldings } from "@/lib/dividends/sync";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically
// when CRON_SECRET is set as a project env var — this rejects everyone else.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const result = await syncDividendsForAllHoldings(supabase);

  return NextResponse.json(result);
}

// Sequential rate-limited API calls (5 req/min) can take a while once the
// unique-ticker count grows. 60s is the safe ceiling on Vercel's Hobby plan;
// raise it (Pro allows up to 300s) if the ticker count outgrows one run —
// each ticker is processed independently so a killed run just resumes
// cleanly on the next scheduled invocation.
export const maxDuration = 60;
