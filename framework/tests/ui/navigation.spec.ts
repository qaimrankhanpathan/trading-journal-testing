import { test, expect, TAG } from "@fixtures";

// SMOKE: the main pages open. The full page-by-page check is tests/functional/page-health.spec.ts.

const MAIN_PAGES = [
  { path: "/", heading: "Dashboard" },
  { path: "/trades/", heading: "Trades" },
  { path: "/accounts/", heading: "Accounts" },
  { path: "/calculator/", heading: "Position size" },
  { path: "/settings/", heading: "Settings" },
];

test.describe("Main pages", { tag: [TAG.UI, TAG.SMOKE] }, () => {
  for (const { path, heading } of MAIN_PAGES) {
    test(`${path} shows "${heading}"`, async ({ data, page }) => {
      await data.account(); // the Dashboard shows a welcome card instead of its heading when there are no accounts

      await page.goto(path);

      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    });
  }

  test("the test copy banner is shown, so nobody mistakes it for the real journal", async ({ data, dashboardPage }) => {
    await data.account();

    await dashboardPage.open();

    await expect(dashboardPage.testCopyBanner).toBeVisible();
  });
});
