import { test as base } from "@playwright/test";
import { AccountsPage, CalculatorPage, DashboardPage, ImportPage, TradesPage } from "../pages";

/**
 * PAGE fixtures: a test asks for a page object by name and gets it ready to use.
 *
 *   test("...", async ({ tradesPage }) => { await tradesPage.open(); ... });
 *
 * No `new TradesPage(page)` lines in every test, and a page object is only created when a test asks for it.
 */
type Pages = {
  accountsPage: AccountsPage;
  calculatorPage: CalculatorPage;
  dashboardPage: DashboardPage;
  importPage: ImportPage;
  tradesPage: TradesPage;
};

export const test = base.extend<Pages>({
  accountsPage: async ({ page }, use) => use(new AccountsPage(page)),
  calculatorPage: async ({ page }, use) => use(new CalculatorPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  importPage: async ({ page }, use) => use(new ImportPage(page)),
  tradesPage: async ({ page }, use) => use(new TradesPage(page)),
});
