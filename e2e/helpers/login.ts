import type { Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
}

export async function addHoldingViaModal(
  page: Page,
  { ticker, quantity, acquiredDate }: { ticker: string; quantity: string; acquiredDate?: string },
): Promise<void> {
  await page.getByText("+ Add holding", { exact: true }).click();
  await page.fill("#ticker", ticker);
  await page.fill("#quantity", quantity);
  if (acquiredDate) {
    await page.fill("#acquiredDate", acquiredDate);
  }
  await page.locator('dialog button[type="submit"]').click();
}
