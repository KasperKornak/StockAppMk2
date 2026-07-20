import { expect, test } from "@playwright/test";
import { addHoldingViaModal, loginAs } from "./helpers/login";
import { supabaseAdmin } from "./helpers/supabase-admin";
import { createConfirmedTestUser, deleteTestUser } from "./helpers/test-user";

test.describe("Holdings", () => {
  test("adding a supported ticker creates a holding with the correct domicile", async ({
    page,
  }) => {
    const user = await createConfirmedTestUser();
    try {
      await loginAs(page, user.email, user.password);
      await addHoldingViaModal(page, { ticker: "AAPL", quantity: "10" });
      await expect(page.locator("text=AAPL")).toBeVisible({ timeout: 15000 });
      await expect(page.locator("text=USA")).toBeVisible();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("adding a duplicate ticker is rejected", async ({ page }) => {
    const user = await createConfirmedTestUser();
    try {
      await loginAs(page, user.email, user.password);
      await addHoldingViaModal(page, { ticker: "AAPL", quantity: "10" });
      // Wait for the first add to actually land (rate-limited Massive call)
      // before attempting the duplicate, rather than a fixed guess-timeout.
      await expect(page.locator("text=AAPL")).toBeVisible({ timeout: 20000 });
      await addHoldingViaModal(page, { ticker: "AAPL", quantity: "10" });
      await expect(page.locator("text=/masz już pozycję/i")).toBeVisible({
        timeout: 20000,
      });
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("adding an unsupported ticker offers a request-support action", async ({ page }) => {
    const user = await createConfirmedTestUser();
    try {
      await loginAs(page, user.email, user.password);
      await addHoldingViaModal(page, { ticker: "ZZZNOTATICKER", quantity: "1" });
      await expect(page.locator("text=/nie jest jeszcze obsługiwany/i")).toBeVisible({
        timeout: 15000,
      });
      await page.click("text=/Zgłoś zapotrzebowanie/i");

      await expect
        .poll(async () => {
          const { data } = await supabaseAdmin
            .from("ticker_support_requests")
            .select("ticker")
            .eq("user_id", user.id);
          return data?.[0]?.ticker;
        })
        .toBe("ZZZNOTATICKER");
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("selling more shares than held as of that date is blocked", async ({ page }) => {
    const user = await createConfirmedTestUser();
    try {
      await loginAs(page, user.email, user.password);
      await addHoldingViaModal(page, { ticker: "AAPL", quantity: "5" });
      await expect(page.locator("text=AAPL")).toBeVisible({ timeout: 20000 });

      await page.click("text=AAPL");
      await page.waitForURL("**/dashboard/holdings/**");
      await page.selectOption("#transactionType", "sell");
      await page.fill("#txQuantity", "100");
      await page.click('button:has-text("Dodaj transakcję")');
      await expect(page.locator("text=/tylko 5/i")).toBeVisible({ timeout: 10000 });
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("deleting a holding removes it and cascades to its transactions", async ({ page }) => {
    const user = await createConfirmedTestUser();
    try {
      await loginAs(page, user.email, user.password);
      await addHoldingViaModal(page, { ticker: "AAPL", quantity: "5" });
      await expect(page.locator("text=AAPL")).toBeVisible({ timeout: 20000 });

      await page.click("text=AAPL");
      await page.waitForURL("**/dashboard/holdings/**");
      const holdingId = page.url().split("/").pop()!;

      page.once("dialog", (dialog) => dialog.accept());
      await page.click("text=Usuń pozycję");
      await page.waitForURL("**/dashboard");

      const { data: holdingRows } = await supabaseAdmin
        .from("holdings")
        .select("id")
        .eq("id", holdingId);
      expect(holdingRows).toEqual([]);

      const { data: txRows } = await supabaseAdmin
        .from("holding_transactions")
        .select("id")
        .eq("holding_id", holdingId);
      expect(txRows).toEqual([]);
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
