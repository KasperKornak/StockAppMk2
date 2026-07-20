import { expect, test } from "@playwright/test";
import { addHoldingViaModal, loginAs } from "./helpers/login";
import { createConfirmedTestUser, deleteTestUser } from "./helpers/test-user";

test.describe("RLS isolation", () => {
  test("a user cannot see another user's holdings on the dashboard", async ({ page }) => {
    const userA = await createConfirmedTestUser();
    const userB = await createConfirmedTestUser();
    try {
      await loginAs(page, userA.email, userA.password);
      await addHoldingViaModal(page, { ticker: "AAPL", quantity: "10" });
      await expect(page.locator("text=AAPL")).toBeVisible({ timeout: 15000 });

      await page.click('button:has-text("Wyloguj się")');
      await page.waitForURL("http://localhost:3000/");

      await loginAs(page, userB.email, userB.password);
      await expect(page.locator("text=Brak pozycji")).toBeVisible();
      await expect(page.locator("text=AAPL")).not.toBeVisible();
    } finally {
      await deleteTestUser(userA.id);
      await deleteTestUser(userB.id);
    }
  });

  test("direct navigation to another user's holding detail page is blocked", async ({ page }) => {
    const userA = await createConfirmedTestUser();
    const userB = await createConfirmedTestUser();
    try {
      await loginAs(page, userA.email, userA.password);
      await addHoldingViaModal(page, { ticker: "AAPL", quantity: "10" });
      await expect(page.locator("text=AAPL")).toBeVisible({ timeout: 20000 });
      await page.click("text=AAPL");
      await page.waitForURL("**/dashboard/holdings/**");
      const holdingUrl = page.url();

      await page.click('button:has-text("Wyloguj się")');
      await page.waitForURL("http://localhost:3000/");

      await loginAs(page, userB.email, userB.password);
      await page.goto(holdingUrl);
      await expect(page.locator("text=/404|not found/i")).toBeVisible();
    } finally {
      await deleteTestUser(userA.id);
      await deleteTestUser(userB.id);
    }
  });
});
