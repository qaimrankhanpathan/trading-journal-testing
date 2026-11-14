import { test, expect } from "../../support/test";
import { createPracticeAccount, deletePracticeAccount } from "../../support/data";

// Lesson 4 solution: checking results.

test("the Back button is disabled on the first page and enabled after moving on", async ({ page }) => {
  await page.goto("/");
  const back = page.getByTestId("back-button");
  await expect(back).toBeDisabled();

  await page.getByRole("link", { name: "Trades", exact: true }).click();
  await expect(page).toHaveURL(/\/trades\/$/);
  await expect(back).toBeEnabled();

  await back.click();
  await expect(page).toHaveURL("/"); // relative to baseURL
});

test("a new account appears in the Accounts table with the right numbers", async ({ page, request }) => {
  const account = await createPracticeAccount(request);
  await page.goto("/accounts/");

  const row = page.getByRole("row").filter({ hasText: account.name });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("FundingPips");
  await expect(row).toContainText("$10,000.00");
  await expect(row).toContainText("8%");

  await deletePracticeAccount(request, account.id);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: account.name })).toHaveCount(0);
});

test("risk on the Position size page never goes above 1% of the account", async ({ page, request }) => {
  const account = await createPracticeAccount(request);
  await page.goto("/calculator/");
  await page.getByLabel("Account").selectOption(String(account.id));
  await page.getByLabel("Symbol").selectOption("EURUSD");
  await page.getByRole("button", { name: "Buy", exact: true }).click();
  await page.getByLabel("Entry").fill("1.1");
  await page.getByLabel("Stop loss").fill("1.099");

  // Read a number from the page, then check it with plain (non-retrying) expects.
  // The Result card shows small label/figure pairs: <div><span>Risk</span><b>$50.00</b></div>
  // CSS: the <b> directly inside the <div> whose own <span> says exactly "Risk".
  const riskText = page.locator("div:has(> span:text-is('Risk')) > b");
  await expect(riskText).toHaveText(/^\$[\d,.]+$/); // waits until a dollar figure is shown
  const risk = Number((await riskText.innerText()).replace(/[$,]/g, ""));
  expect(risk).toBeGreaterThan(0);
  expect(risk).toBeLessThanOrEqual(100); // 1% of $10,000

  await deletePracticeAccount(request, account.id);
});

test("soft assertions report every problem, not just the first", async ({ page }) => {
  await page.goto("/calculator/");
  await expect.soft(page.getByLabel("Entry")).toBeVisible();
  await expect.soft(page.getByLabel("Stop loss")).toBeVisible();
  await expect.soft(page.getByLabel("Take profit")).toBeVisible();
});

test("expect.poll keeps asking until the answer is right", async ({ request }) => {
  const account = await createPracticeAccount(request);
  await expect
    .poll(async () => {
      const list = await (await request.get("/api/accounts")).json();
      return list.some((a: { id: number }) => a.id === account.id);
    })
    .toBe(true);
  await deletePracticeAccount(request, account.id);
});
