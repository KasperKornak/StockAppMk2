import { expect, test } from "@playwright/test";
import { addHoldingViaModal, loginAs } from "./helpers/login";
import { supabaseAdmin } from "./helpers/supabase-admin";
import { triggerSync } from "./helpers/sync";
import { createConfirmedTestUser, deleteTestUser } from "./helpers/test-user";

test("in-app notifications are created by sync and can be marked read", async ({ page }) => {
  const user = await createConfirmedTestUser();
  try {
    await loginAs(page, user.email, user.password);
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
      .select("id")
      .eq("holding_id", holding!.id);
    const eventIds = (events ?? []).map((e) => e.id);

    // FR-DIV-002/004: the sync itself must create the notification rows.
    const { data: notifications } = await supabaseAdmin
      .from("notifications")
      .select("id, read_at")
      .in("dividend_event_id", eventIds);
    expect(notifications?.length).toBeGreaterThan(0);
    expect(notifications!.every((n) => n.read_at === null)).toBe(true);

    await page.reload();
    await page.click('button[aria-label="Powiadomienia"]');
    const firstNotification = page
      .locator('button:has-text("dywidenda potwierdzona"), button:has-text("nadchodząca dywidenda")')
      .first();
    await expect(firstNotification).toBeVisible({ timeout: 10000 });
    await firstNotification.click();

    // Mark-as-read is a server action + router.refresh(); poll the DB
    // rather than the UI so this doesn't depend on exact re-render timing.
    await expect
      .poll(
        async () => {
          const { data } = await supabaseAdmin
            .from("notifications")
            .select("id")
            .in("dividend_event_id", eventIds)
            .not("read_at", "is", null);
          return (data ?? []).length;
        },
        { timeout: 10000 },
      )
      .toBeGreaterThan(0);
  } finally {
    await deleteTestUser(user.id);
  }
});
