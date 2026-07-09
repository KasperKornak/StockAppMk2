import { loadEnv } from "./env";

loadEnv();

export interface SyncResult {
  tickersSynced: number;
  eventsCreated: number;
  eventsFinalized: number;
  eventsSkippedNoShares: number;
}

export async function triggerSync(baseURL = "http://localhost:3000"): Promise<SyncResult> {
  const response = await fetch(`${baseURL}/api/cron/sync-dividends`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  if (!response.ok) {
    throw new Error(`Sync failed: HTTP ${response.status}`);
  }
  return response.json();
}
