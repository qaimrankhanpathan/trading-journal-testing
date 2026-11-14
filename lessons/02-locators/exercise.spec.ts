import { test, expect } from "../../support/test";

// Lesson 2 exercise: write the locators. Each test only needs 1-3 lines. Remove ".fixme" to run a test.
// Tip: run  npx playwright codegen http://localhost:8001  and click "Pick locator" to see what Playwright suggests.

test.fixme("getByRole: the side menu has a Trades link", async ({ page }) => {
  await page.goto("/");
  // TODO: check that a link named exactly "Trades" is visible.
});

test.fixme("getByRole: the Accounts page has an Add account button", async ({ page }) => {
  // TODO: open /accounts/ and check the "+ Add account" button is visible.
});

test.fixme("getByLabel: the Position size page has Entry and Stop loss boxes", async ({ page }) => {
  // TODO: open /calculator/ and check the boxes labelled "Entry" and "Stop loss" are visible.
});

test.fixme("getByTestId: the Back button exists", async ({ page }) => {
  // TODO: open the Dashboard and find the Back button by its test id "back-button".
});

test.fixme("scoping: the section tabs on the Position size page", async ({ page }) => {
  await page.goto("/calculator/");
  // TODO 1: find the navigation named "Sections" and keep it in a variable called tabs.
  // TODO 2: inside tabs, check the links "Position size" and "Trade plan" are visible.
});

test.fixme("filter and count: the Buy and Sell buttons", async ({ page }) => {
  await page.goto("/calculator/");
  // TODO 1: take all buttons, and filter them to the ones whose text is exactly Buy or Sell.
  //         Hint: page.getByRole("button").filter({ hasText: /^(Buy|Sell)$/ })
  // TODO 2: check there are exactly 2, and the first one says "Buy".
});
