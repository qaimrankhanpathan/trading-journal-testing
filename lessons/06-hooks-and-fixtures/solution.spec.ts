import { test as base, expect } from "../../support/test";
import { createPracticeAccount, createPracticeTrade, deletePracticeAccount, type Account, type Trade } from "../../support/data";

// Lesson 6 solution: hooks (beforeEach/afterEach) and fixtures (test.extend).

// ---- Part 1: hooks --------------------------------------------------------------------------

base.describe("hooks", () => {
  let account: Account;

  base.beforeEach(async ({ request }) => {
    account = await createPracticeAccount(request); // runs before EVERY test in this describe
  });

  base.afterEach(async ({ request }) => {
    await deletePracticeAccount(request, account.id); // runs after every test, even a failed one
  });

  base("the account is on the Accounts page", async ({ page }) => {
    await page.goto("/accounts/");
    await expect(page.getByRole("row").filter({ hasText: account.name })).toHaveCount(1);
  });

  base("the account is in the Position size drop-down", async ({ page }) => {
    await page.goto("/calculator/");
    await expect(page.getByLabel("Account").locator(`option[value="${account.id}"]`)).toHaveCount(1);
  });
});

// ---- Part 2: fixtures -----------------------------------------------------------------------
// A fixture is a hook you ask for by name. The code before use() is the set-up, the code after is the clean-up.
const test = base.extend<{ practiceAccount: Account; winningTrade: Trade }>({
  practiceAccount: async ({ request }, use) => {
    const account = await createPracticeAccount(request);
    await use(account);
    await deletePracticeAccount(request, account.id);
  },
  // Fixtures can use other fixtures: this one needs practiceAccount, so Playwright makes that first.
  winningTrade: async ({ request, practiceAccount }, use) => {
    await use(await createPracticeTrade(request, practiceAccount.id, true));
    // no clean-up needed: deleting the account (above) deletes its trades too
  },
});

test("fixture: the practice account starts with no trades", async ({ practiceAccount, request }) => {
  const trades = await (await request.get(`/api/trades?account_id=${practiceAccount.id}`)).json();
  expect(trades).toHaveLength(0);
});

test("fixture: a winning trade shows on the Trades page", async ({ page, practiceAccount, winningTrade }) => {
  expect(winningTrade.account_id).toBe(practiceAccount.id);
  await page.goto("/trades/");
  await page.getByRole("button", { name: "All time" }).click(); // the practice trade is from October 2026
  const row = page.locator(".trades-table tbody tr").filter({ hasText: practiceAccount.name });
  await expect(row).toContainText("EURUSD");
  await expect(row).toContainText("+$200.00");
  // The badge LOOKS like "PRE-JOURNAL" on screen, but that is only CSS capitals: the real text is "Pre-journal".
  await expect(row).toContainText("Pre-journal"); // dated before your journal start, so never judged
});
