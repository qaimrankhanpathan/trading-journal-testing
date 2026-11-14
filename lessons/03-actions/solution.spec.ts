import { test, expect } from "../../support/test";
import { createPracticeAccount, deletePracticeAccount, type Account } from "../../support/data";

// Lesson 3 solution: clicking, typing and choosing, on the Position size page.

let account: Account;

test.beforeAll(async ({ request }) => {
  account = await createPracticeAccount(request); // a $10,000 evaluation account, only in the test copy
});

test.afterAll(async ({ request }) => {
  await deletePracticeAccount(request, account.id);
});

test("size a EURUSD buy with a 10 pip stop", async ({ page }) => {
  await page.goto("/calculator/");

  await page.getByLabel("Account").selectOption(String(account.id)); // choose from a drop-down (by value)
  await page.getByLabel("Symbol").selectOption("EURUSD"); // ... or by the visible text
  await page.getByRole("button", { name: "Buy", exact: true }).click(); // click a button
  await page.getByLabel("Entry").fill("1.1"); // type into a box (clears it first)
  await page.getByLabel("Stop loss").fill("1.099");

  const result = page.locator(".card", { has: page.getByRole("heading", { name: "Result" }) });
  await expect(result).toContainText("Lots");
  await expect(result).toContainText("of starting balance");
});

test("pressing keys: Tab moves from Entry to Stop loss", async ({ page }) => {
  await page.goto("/calculator/");
  await page.getByLabel("Entry").click();
  await page.keyboard.type("1.25");
  await page.getByLabel("Entry").press("Tab");
  await expect(page.getByLabel("Entry")).toHaveValue("1.25");
  await expect(page.getByLabel("Entry")).not.toBeFocused();
});

test("clicking a menu link changes the page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Trades", exact: true }).click();
  await expect(page).toHaveURL(/\/trades\/$/);
});
