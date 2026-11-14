import { test, expect } from "./pages/fixtures";
import { createPracticeTrade } from "../../support/data";

// Lesson 7 solution: the same kind of tests as before, but every locator lives in a page object (./pages).
// When the journal's screen changes, you fix ONE file in ./pages instead of every test.

test("the practice account is listed", async ({ accountsPage, practiceAccount }) => {
  await accountsPage.open();
  await expect(accountsPage.addButton).toBeVisible();
  await expect(accountsPage.row(practiceAccount.name)).toContainText("$10,000.00");
});

test("position size risk stays at or under 1%", async ({ calculatorPage, practiceAccount }) => {
  await calculatorPage.open();
  await calculatorPage.size({ accountId: practiceAccount.id, symbol: "EURUSD", side: "Buy", entry: "1.1", stop: "1.099" });
  await expect(calculatorPage.figure("Risk")).toHaveText(/^\$[\d,.]+$/);
  const risk = await calculatorPage.riskDollars();
  expect(risk).toBeGreaterThan(0);
  expect(risk).toBeLessThanOrEqual(100);
});

test("a losing trade shows a loss of $100", async ({ tradesPage, practiceAccount, request }) => {
  await createPracticeTrade(request, practiceAccount.id, false);
  await tradesPage.open();
  await tradesPage.showAllTime();
  // The journal writes losses with a proper minus sign (U+2212 "−"), not the keyboard hyphen "-".
  // A regular expression that accepts either keeps the test readable and robust.
  await expect(tradesPage.rowFor(practiceAccount.name)).toContainText(/[−-]\$100\.00/);
});

test("the Back button returns to the Accounts page", async ({ accountsPage, tradesPage, page }) => {
  await accountsPage.open();
  await accountsPage.menuLink("Trades").click();
  await expect(tradesPage.heading).toContainText("Trades");
  await tradesPage.backButton.click();
  await expect(page).toHaveURL(/\/accounts\/$/);
});

test("a stop on the wrong side of the entry gives no size", async ({ calculatorPage, practiceAccount }) => {
  await calculatorPage.open();
  // A BUY with the stop ABOVE the entry is impossible: the journal must never give a size for it.
  await calculatorPage.size({ accountId: practiceAccount.id, symbol: "EURUSD", side: "Buy", entry: "1.1", stop: "1.101" });
  await expect(calculatorPage.figure("Lots")).toHaveText("0");
  await expect(calculatorPage.figure("Risk")).toHaveText("$0.00");
});
