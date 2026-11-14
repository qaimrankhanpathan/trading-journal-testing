import { test, expect } from "../../support/test";

// Lesson 1 exercise. Read lessons/01-first-test/README.md first.
// The first test is already written: run it with  npx playwright test lessons/01 --project=exercises
// Then finish the other two. Remove ".fixme" from a test when you start working on it.

test("the Dashboard opens", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Trading Journal");
});

test.fixme("the test copy banner is shown", async ({ page }) => {
  // TODO 1: open the Dashboard.
  // TODO 2: check that the text "TEST COPY" is visible. Hint: page.getByText(...) and toBeVisible().
});

test.fixme("the Accounts page opens", async ({ page }) => {
  // TODO 1: open /accounts/
  // TODO 2: check that the main heading (h1) contains "Accounts".
  //         Hint: page.getByRole("heading", { level: 1 }) and toContainText(...)
});
