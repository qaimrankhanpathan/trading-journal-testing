import { test, expect } from "../../support/test";

// Lesson 2 solution: finding things on the page.

test("getByRole: the side menu has a Trades link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Trades", exact: true })).toBeVisible();
});

test("getByRole: the Accounts page has an Add account button", async ({ page }) => {
  await page.goto("/accounts/");
  await expect(page.getByRole("button", { name: "+ Add account" })).toBeVisible();
});

test("getByLabel: the Position size page has Entry and Stop loss boxes", async ({ page }) => {
  await page.goto("/calculator/");
  await expect(page.getByLabel("Entry")).toBeVisible();
  await expect(page.getByLabel("Stop loss")).toBeVisible();
});

test("getByTestId: the Back button exists", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("back-button")).toBeVisible();
});

test("scoping: the section tabs on the Position size page", async ({ page }) => {
  await page.goto("/calculator/");
  // First find the tab bar, then look only inside it.
  const tabs = page.getByRole("navigation", { name: "Sections" });
  await expect(tabs.getByRole("link", { name: "Position size" })).toBeVisible();
  await expect(tabs.getByRole("link", { name: "Trade plan" })).toBeVisible();
});

test("filter and count: the Buy and Sell buttons", async ({ page }) => {
  await page.goto("/calculator/");
  const sideButtons = page.getByRole("button").filter({ hasText: /^(Buy|Sell)$/ });
  await expect(sideButtons).toHaveCount(2);
  await expect(sideButtons.first()).toHaveText("Buy");
});
