import { test, expect, TAG } from "@fixtures";

// FEATURE: Getting around: side menu, "More pages", Back button (docs/TEST_PLAN.md, TC-NAV-*).

test.describe("Navigation", { tag: [TAG.FUNCTIONAL, TAG.REGRESSION] }, () => {
  test("TC-NAV-01 the side menu opens a main page", async ({ dashboardPage, tradesPage, page }) => {
    await dashboardPage.open();

    await dashboardPage.menu.goTo("Trades");

    await tradesPage.waitUntilShown();
    await expect(page).toHaveURL(/\/trades\/$/);
  });

  test("TC-NAV-02 'More pages' opens a page that is not in the trading-day list", async ({ dashboardPage, accountsPage, page }) => {
    await dashboardPage.open();

    await dashboardPage.menu.goTo("Accounts");

    await accountsPage.waitUntilShown();
    await expect(page).toHaveURL(/\/accounts\/$/);
  });

  test("TC-NAV-03 a section tab opens a page inside its group (Trade plan > Position size)", async ({ page, calculatorPage }) => {
    await page.goto("/plan/");

    await calculatorPage.sectionTab("Position size").click();

    await calculatorPage.waitUntilShown();
    await expect(page).toHaveURL(/\/calculator\/$/);
  });

  test("TC-NAV-04 Back returns to the page you came from", async ({ accountsPage, tradesPage, page }) => {
    await accountsPage.open();
    await accountsPage.menu.goTo("Trades");
    await tradesPage.waitUntilShown();

    await tradesPage.backButton.click();

    await expect(page).toHaveURL(/\/accounts\/$/);
  });
});
