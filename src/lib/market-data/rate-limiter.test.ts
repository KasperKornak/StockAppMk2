import { describe, expect, it, vi } from "vitest";
import { RateLimiter } from "./rate-limiter";

describe("RateLimiter", () => {
  it("does not delay the first call", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const limiter = new RateLimiter({ requestsPerMinute: 5, now: () => 0, sleep });

    await limiter.schedule(async () => "ok");

    expect(sleep).not.toHaveBeenCalled();
  });

  it("spaces calls at 60000/requestsPerMinute ms when called back-to-back", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const clock = 0;
    const limiter = new RateLimiter({ requestsPerMinute: 5, now: () => clock, sleep });

    await limiter.schedule(async () => "first");
    await limiter.schedule(async () => "second");

    // 60_000 / 5 = 12_000ms between calls
    expect(sleep).toHaveBeenCalledWith(12_000);
  });

  it("does not wait if enough real time already elapsed between calls", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    let clock = 0;
    const limiter = new RateLimiter({ requestsPerMinute: 5, now: () => clock, sleep });

    await limiter.schedule(async () => "first");
    clock = 20_000; // more than the 12_000ms interval has passed
    await limiter.schedule(async () => "second");

    expect(sleep).not.toHaveBeenCalled();
  });
});
