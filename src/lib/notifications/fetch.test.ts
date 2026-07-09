import { describe, expect, it } from "vitest";
import { normalizeNotificationRow } from "./fetch";

describe("normalizeNotificationRow", () => {
  it("flattens a nested row (object-shaped embeds)", () => {
    const item = normalizeNotificationRow({
      id: "n1",
      type: "upcoming",
      read_at: null,
      dividend_events: {
        pay_date: "2026-08-01",
        gross_amount_foreign: 2.6,
        foreign_currency: "USD",
        amount_to_set_aside_pln: 1.2,
        holdings: { ticker: "AAPL" },
      },
    });

    expect(item).toEqual({
      id: "n1",
      type: "upcoming",
      read: false,
      ticker: "AAPL",
      payDate: "2026-08-01",
      grossAmountForeign: 2.6,
      foreignCurrency: "USD",
      amountToSetAsidePln: 1.2,
    });
  });

  it("handles array-shaped embeds the same way", () => {
    const item = normalizeNotificationRow({
      id: "n2",
      type: "confirmed",
      read_at: "2026-08-02T00:00:00Z",
      dividend_events: [
        {
          pay_date: "2026-08-01",
          gross_amount_foreign: 2.6,
          foreign_currency: "USD",
          amount_to_set_aside_pln: 1.2,
          holdings: [{ ticker: "AAPL" }],
        },
      ],
    });

    expect(item?.ticker).toBe("AAPL");
    expect(item?.read).toBe(true);
  });

  it("returns null when the dividend event is missing", () => {
    const item = normalizeNotificationRow({
      id: "n3",
      type: "upcoming",
      read_at: null,
      dividend_events: null,
    });

    expect(item).toBeNull();
  });
});
