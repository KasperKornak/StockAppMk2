/**
 * Spaces out calls to respect a requests-per-minute ceiling (Massive's free
 * "Stocks Basic" plan allows 5/min). Sequential spacing rather than a bucket
 * — sufficient for a background sync job that isn't bursty.
 */

export interface RateLimiterOptions {
  requestsPerMinute: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RateLimiter {
  private readonly minIntervalMs: number;
  private readonly now: () => number;
  private readonly sleep: (ms: number) => Promise<void>;
  private nextAvailableAt = 0;

  constructor({ requestsPerMinute, now = Date.now, sleep = defaultSleep }: RateLimiterOptions) {
    if (requestsPerMinute <= 0) {
      throw new Error("requestsPerMinute must be positive");
    }
    this.minIntervalMs = 60_000 / requestsPerMinute;
    this.now = now;
    this.sleep = sleep;
  }

  async schedule<T>(task: () => Promise<T>): Promise<T> {
    const now = this.now();
    const waitMs = Math.max(0, this.nextAvailableAt - now);
    this.nextAvailableAt = Math.max(this.nextAvailableAt, now) + this.minIntervalMs;

    if (waitMs > 0) {
      await this.sleep(waitMs);
    }

    return task();
  }
}
