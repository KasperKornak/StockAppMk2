import { RateLimiter } from "./rate-limiter";

const MASSIVE_BASE_URL = "https://api.massive.com";
const DEFAULT_REQUESTS_PER_MINUTE = 5; // Stocks Basic (free) plan limit

let sharedLimiter: RateLimiter | null = null;

function getLimiter(): RateLimiter {
  if (!sharedLimiter) {
    const requestsPerMinute = Number(
      process.env.MASSIVE_REQUESTS_PER_MINUTE ?? DEFAULT_REQUESTS_PER_MINUTE,
    );
    sharedLimiter = new RateLimiter({ requestsPerMinute });
  }
  return sharedLimiter;
}

/** Rate-limited GET against the Massive API. Returns null on 404. */
export async function massiveGet<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T | null> {
  const apiKey = process.env.MASSIVE_API_KEY;
  if (!apiKey) {
    throw new Error("MASSIVE_API_KEY is not set");
  }

  const url = new URL(path, MASSIVE_BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("apiKey", apiKey);

  return getLimiter().schedule(async () => {
    const response = await fetch(url.toString());

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Massive API error ${response.status} for ${path}`);
    }

    return (await response.json()) as T;
  });
}
