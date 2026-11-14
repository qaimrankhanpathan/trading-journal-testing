import { test, expect } from "../../support/test";
import { createPracticeAccount, deletePracticeAccount } from "../../support/data";

// Lesson 4 exercise: assertions. Remove ".fixme" to run a test.

test.fixme("the Back button is disabled on the first page and enabled after moving on", async ({ page }) => {
  await page.goto("/");
  const back = page.getByTestId("back-button");
  // TODO 1: back should be disabled.
  // TODO 2: click the "Trades" menu link; check the URL ends with /trades/ and back is now enabled.
  // TODO 3: click back; check the URL is "/" again.
});

test.fixme("a new account appears in the Accounts table with the right numbers", async ({ page, request }) => {
  const account = await createPracticeAccount(request);
  await page.goto("/accounts/");
  // TODO 1: find the table row that has account.name in it:  page.getByRole("row").filter({ hasText: ... })
  // TODO 2: check there is exactly 1 such row, and it contains "FundingPips", "$10,000.00" and "8%".
  // TODO 3: delete the account (deletePracticeAccount), reload the page, and check the row count is now 0.
});

test.fixme("risk on the Position size page never goes above 1% of the account", async ({ page, request }) => {
  const account = await createPracticeAccount(request);
  await page.goto("/calculator/");
  await page.getByLabel("Account").selectOption(String(account.id));
  await page.getByLabel("Symbol").selectOption("EURUSD");
  await page.getByRole("button", { name: "Buy", exact: true }).click();
  await page.getByLabel("Entry").fill("1.1");
  await page.getByLabel("Stop loss").fill("1.099");

  const riskText = page.locator("div:has(> span:text-is('Risk')) > b");
  // TODO 1: wait until riskText shows a dollar figure (toHaveText with /^\$[\d,.]+$/).
  // TODO 2: read it with innerText(), remove "$" and "," and turn it into a Number.
  // TODO 3: check it is greater than 0 and at most 100 (1% of $10,000).
  // TODO 4: delete the practice account.
});

test.fixme("soft assertions report every problem, not just the first", async ({ page }) => {
  await page.goto("/calculator/");
  // TODO: with expect.soft, check "Entry", "Stop loss" and "Take profit" are visible.
  // Then change one label to "Take profitt" to see how a soft failure is reported, and change it back.
});

test.fixme("expect.poll keeps asking until the answer is right", async ({ request }) => {
  const account = await createPracticeAccount(request);
  // TODO: use expect.poll(async () => ...) to read GET /api/accounts until the list contains account.id,
  //       then .toBe(true). Delete the account at the end.
});
