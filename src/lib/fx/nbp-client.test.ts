import { afterEach, describe, expect, it, vi } from "vitest";
import { getNbpRateBeforeDate } from "./nbp-client";

describe("getNbpRateBeforeDate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 1 for PLN without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const rate = await getNbpRateBeforeDate("PLN", "2026-03-15");

    expect(rate).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the most recent published rate in the lookback window", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        rates: [
          { effectiveDate: "2026-03-11", mid: 4.05 },
          { effectiveDate: "2026-03-12", mid: 4.06 },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const rate = await getNbpRateBeforeDate("USD", "2026-03-13");

    expect(rate).toBe(4.06);
  });

  it("returns null when no rates are published in the window (404)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal("fetch", fetchMock);

    const rate = await getNbpRateBeforeDate("USD", "2026-03-13");

    expect(rate).toBeNull();
  });

  it("throws on a non-404 error response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getNbpRateBeforeDate("USD", "2026-03-13")).rejects.toThrow("500");
  });
});
