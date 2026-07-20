import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers/login";
import {
  createConfirmedTestUser,
  deleteTestUser,
  deleteTestUserByEmail,
} from "./helpers/test-user";

test.describe("Auth", () => {
  test("signup form is wired to Supabase (succeeds or hits the real rate limit)", async ({
    page,
  }) => {
    const email = `e2e-signup-${Date.now()}@mailinator.com`;
    try {
      await page.goto("/signup");
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', "TestPassword123!");
      await page.click('button[type="submit"]');

      // Either outcome proves the form reached Supabase for real; Supabase's
      // free-tier email rate limit is expected to trigger occasionally.
      await expect(page.locator("body")).toContainText(/Sprawdź skrzynkę e-mail|rate limit/i, {
        timeout: 10000,
      });
    } finally {
      await deleteTestUserByEmail(email);
    }
  });

  test("login with the wrong password shows an error and stays on the page", async ({ page }) => {
    const user = await createConfirmedTestUser();
    try {
      await page.goto("/login");
      await page.fill('input[type="email"]', user.email);
      await page.fill('input[type="password"]', "the-wrong-password");
      await page.click('button[type="submit"]');
      await expect(page.locator("text=/invalid/i")).toBeVisible({ timeout: 10000 });
      expect(page.url()).toContain("/login");
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("unauthenticated access to /dashboard redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login");
  });

  test("logout clears the session and re-blocks /dashboard", async ({ page }) => {
    const user = await createConfirmedTestUser();
    try {
      await loginAs(page, user.email, user.password);
      await page.click('button:has-text("Wyloguj się")');
      await page.waitForURL("http://localhost:3000/");
      await page.goto("/dashboard");
      await page.waitForURL("**/login");
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
