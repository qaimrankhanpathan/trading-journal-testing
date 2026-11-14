import { test, expect } from "../../support/test";

// Lesson 1 solution: open pages and check what is on them.

test("the Dashboard opens", async ({ page }) => {
  await page.goto("/"); // baseURL is http://localhost:8001, so "/" is the Dashboard
  await expect(page).toHaveTitle("Trading Journal");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dashboard");
});

test("the test copy banner is shown", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("TEST COPY")).toBeVisible();
});

test("the Accounts page opens", async ({ page }) => {
  await page.goto("/accounts/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Accounts");
});
