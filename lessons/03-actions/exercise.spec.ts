import { test, expect } from "../../support/test";
import { createPracticeAccount, deletePracticeAccount, type Account } from "../../support/data";

// Lesson 3 exercise: actions. A practice account is made for you before the tests and deleted after.

let account: Account;

test.beforeAll(async ({ request }) => {
  account = await createPracticeAccount(request);
});

test.afterAll(async ({ request }) => {
  await deletePracticeAccount(request, account.id);
});

test.fixme("size a EURUSD buy with a 10 pip stop", async ({ page }) => {
  await page.goto("/calculator/");
  // TODO 1: in the "Account" drop-down choose the practice account. Hint: selectOption(String(account.id))
  // TODO 2: in the "Symbol" drop-down choose EURUSD.
  // TODO 3: click the "Buy" button (use exact: true).
  // TODO 4: type 1.1 into "Entry" and 1.099 into "Stop loss".
  // TODO 5: the Result card should contain the word "Lots". The card is:
  //         page.locator(".card", { has: page.getByRole("heading", { name: "Result" }) })
});

test.fixme("pressing keys: Tab moves from Entry to Stop loss", async ({ page }) => {
  await page.goto("/calculator/");
  // TODO 1: click the Entry box and type 1.25 with page.keyboard.type(...)
  // TODO 2: press Tab in the Entry box.
  // TODO 3: the Entry box should have the value "1.25" and should no longer be focused.
});

test.fixme("clicking a menu link changes the page", async ({ page }) => {
  await page.goto("/");
  // TODO: click the "Trades" link in the side menu, then check the address ends with /trades/
  //       Hint: await expect(page).toHaveURL(/\/trades\/$/)
});
