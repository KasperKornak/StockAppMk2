import { afterEach, describe, expect, it, vi } from "vitest";
import { getCachedNbpRate } from "./nbp-rate-cache";

// Minimal stand-in for the chainable supabase-js query builder used here.
function createSupabaseStub({
  cachedRate,
  upsert = vi.fn().mockResolvedValue({ error: null }),
}: {
  cachedRate: number | null;
  upsert?: ReturnType<typeof vi.fn>;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: cachedRate !== null ? { mid_rate: cachedRate } : null,
  });
  const from = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle }),
      }),
    }),
    upsert,
  });
  return { from } as never;
}

describe("getCachedNbpRate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the cached rate without calling NBP", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const supabase = createSupabaseStub({ cachedRate: 4.05 });

    const rate = await getCachedNbpRate(supabase, "USD", "2026-03-13");

    expect(rate).toBe(4.05);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches from NBP and stores the result on a cache miss", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ rates: [{ effectiveDate: "2026-03-12", mid: 4.06 }] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = createSupabaseStub({ cachedRate: null, upsert });

    const rate = await getCachedNbpRate(supabase, "USD", "2026-03-13");

    expect(rate).toBe(4.06);
    expect(upsert).toHaveBeenCalledWith(
      { currency: "USD", rate_date: "2026-03-13", mid_rate: 4.06 },
      { onConflict: "currency,rate_date" },
    );
  });

  it("does not upsert when NBP has no rate to return", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal("fetch", fetchMock);
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = createSupabaseStub({ cachedRate: null, upsert });

    const rate = await getCachedNbpRate(supabase, "USD", "2026-03-13");

    expect(rate).toBeNull();
    expect(upsert).not.toHaveBeenCalled();
  });
});
