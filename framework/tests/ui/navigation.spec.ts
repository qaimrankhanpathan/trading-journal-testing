import { test, expect, TAG } from "@fixtures";

const MAIN_PAGES = [
  { path: "/", heading: "Dashboard" },
  { path: "/trades/", heading: "Trades" },
  { path: "/accounts/", heading: "Accounts" },
  { path: "/calculator/", heading: "Position size" },
  { path: "/settings/", heading: "Settings" },
];

test.describe("Navigation", { tag: TAG.UI }, () => {
  test.describe("every main page opens", { tag: TAG.SMOKE }, () => {
    for (const { path, heading } of MAIN_PAGES) {
      test(`${path} shows "${heading}"`, async ({ page }) => {
        await page.goto(path);

        await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
      });
    }
  });

  test("the test copy banner is shown, so nobody mistakes it for the real journal", { tag: TAG.SMOKE }, async ({ dashboardPage }) => {
    await dashboardPage.open();

    await expect(dashboardPage.testCopyBanner).toBeVisible();
  });

  test("the side menu opens the Trades page", { tag: TAG.REGRESSION }, async ({ dashboardPage, tradesPage, page }) => {
    await dashboardPage.open();

    await dashboardPage.menu.goTo("Trades");

    await tradesPage.waitUntilShown();
    await expect(page).toHaveURL(/\/trades\/$/);
  });

  test("Back returns to the page you came from", { tag: TAG.REGRESSION }, async ({ accountsPage, tradesPage, page }) => {
    await accountsPage.open();
    await accountsPage.menu.goTo("Trades");
    await tradesPage.waitUntilShown();

    await tradesPage.backButton.click();

    await expect(page).toHaveURL(/\/accounts\/$/);
  });
});
