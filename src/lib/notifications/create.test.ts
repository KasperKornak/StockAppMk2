import { describe, expect, it, vi } from "vitest";
import { createNotificationIfEnabled } from "./create";

function createSupabaseStub({
  inAppEnabled,
  upsert = vi.fn().mockResolvedValue({ error: null }),
}: {
  inAppEnabled: boolean | undefined;
  upsert?: ReturnType<typeof vi.fn>;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: inAppEnabled === undefined ? null : { in_app_enabled: inAppEnabled },
  });
  const from = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ maybeSingle }),
    }),
    upsert,
  });
  return { from } as never;
}

describe("createNotificationIfEnabled", () => {
  it("creates a notification when in-app is enabled", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = createSupabaseStub({ inAppEnabled: true, upsert });

    await createNotificationIfEnabled(supabase, "user-1", "event-1", "upcoming");

    expect(upsert).toHaveBeenCalledWith(
      { user_id: "user-1", dividend_event_id: "event-1", type: "upcoming" },
      { onConflict: "dividend_event_id,type", ignoreDuplicates: true },
    );
  });

  it("skips creating a notification when in-app is disabled", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = createSupabaseStub({ inAppEnabled: false, upsert });

    await createNotificationIfEnabled(supabase, "user-1", "event-1", "confirmed");

    expect(upsert).not.toHaveBeenCalled();
  });

  it("defaults to creating a notification when no preferences row exists yet", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = createSupabaseStub({ inAppEnabled: undefined, upsert });

    await createNotificationIfEnabled(supabase, "user-1", "event-1", "upcoming");

    expect(upsert).toHaveBeenCalled();
  });
});
