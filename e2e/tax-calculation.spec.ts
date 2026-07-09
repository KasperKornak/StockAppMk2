import { expect, test } from "@playwright/test";
import { addHoldingViaModal, loginAs } from "./helpers/login";
import { supabaseAdmin } from "./helpers/supabase-admin";
import { triggerSync } from "./helpers/sync";
import { createConfirmedTestUser, deleteTestUser } from "./helpers/test-user";

// These two regression-test real bugs found and fixed during manual testing:
// (1) the foreign tax credit was wrongly capped at the actual amount
//     withheld instead of the DTT treaty rate, and
// (2) dividends predating a holding's acquisition were included using
//     today's share count instead of being excluded.
test.describe("Tax calculation regressions", () => {
  test("US holding without W-8BEN still owes ~4% (treaty-rate cap), not 0%", async ({ page }) => {
    const user = await createConfirmedTestUser();
    try {
      await loginAs(page, user.email, user.password);
      // W-8BEN checkbox deliberately left unchecked -> 30% actual withholding.
      await addHoldingViaModal(page, {
        ticker: "AAPL",
        quantity: "10",
        acquiredDate: "2020-01-01",
      });
      await expect(page.locator("text=AAPL")).toBeVisible({ timeout: 20000 });

      await triggerSync();

      const { data: holding } = await supabaseAdmin
        .from("holdings")
        .select("id")
        .eq("user_id", user.id)
        .single();
      const { data: events } = await supabaseAdmin
        .from("dividend_events")
        .select("amount_to_set_aside_pln, gross_amount_pln, foreign_withholding_rate")
        .eq("holding_id", holding!.id)
        .eq("status", "confirmed")
        .limit(1);

      expect(events?.length).toBeGreaterThan(0);
      const event = events![0];
      expect(event.foreign_withholding_rate).toBe(0.3);
      expect(event.amount_to_set_aside_pln).toBeGreaterThan(0);
      // ~4% of gross (19% Belka - 15% treaty-capped credit), not 0.
      expect(event.amount_to_set_aside_pln).toBeCloseTo(event.gross_amount_pln * 0.04, 0);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("dividends dated before the holding's acquisition date are excluded", async ({ page }) => {
    const user = await createConfirmedTestUser();
    try {
      await loginAs(page, user.email, user.password);
      const acquiredDate = "2026-06-01"; // acquired very recently
      await addHoldingViaModal(page, { ticker: "AAPL", quantity: "10", acquiredDate });
      await expect(page.locator("text=AAPL")).toBeVisible({ timeout: 20000 });

      const result = await triggerSync();
      expect(result.eventsSkippedNoShares).toBeGreaterThan(0);

      const { data: holding } = await supabaseAdmin
        .from("holdings")
        .select("id")
        .eq("user_id", user.id)
        .single();
      const { data: events } = await supabaseAdmin
        .from("dividend_events")
        .select("pay_date")
        .eq("holding_id", holding!.id);

      for (const event of events ?? []) {
        expect(event.pay_date === null || event.pay_date >= acquiredDate).toBe(true);
      }
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
