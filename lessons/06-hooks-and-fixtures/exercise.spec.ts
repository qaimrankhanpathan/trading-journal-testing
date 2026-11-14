import { test as base, expect } from "../../support/test";
import { createPracticeAccount, createPracticeTrade, deletePracticeAccount, type Account, type Trade } from "../../support/data";

// Lesson 6 exercise: hooks and fixtures. Remove ".fixme" to run a test.

// ---- Part 1: hooks --------------------------------------------------------------------------
base.describe("hooks", () => {
  let account: Account;

  // TODO 1: add base.beforeEach that creates a practice account and stores it in `account`.
  // TODO 2: add base.afterEach that deletes it.

  base.fixme("the account is on the Accounts page", async ({ page }) => {
    // TODO: open /accounts/ and check exactly one row contains account.name.
  });

  base.fixme("the account is in the Position size drop-down", async ({ page }) => {
    // TODO: open /calculator/ and check the Account drop-down has an <option> whose value is account.id.
    //       Hint: page.getByLabel("Account").locator(`option[value="${account.id}"]`)
  });
});

// ---- Part 2: fixtures -----------------------------------------------------------------------
const test = base.extend<{ practiceAccount: Account; winningTrade: Trade }>({
  practiceAccount: async ({ request }, use) => {
    // TODO: create a practice account, hand it to the test with `await use(account)`, then delete it.
    throw new Error("practiceAccount fixture not written yet");
  },
  winningTrade: async ({ request, practiceAccount }, use) => {
    // TODO: create a winning trade on practiceAccount and hand it to the test with use(...).
    throw new Error("winningTrade fixture not written yet");
  },
});

test.fixme("fixture: the practice account starts with no trades", async ({ practiceAccount, request }) => {
  // TODO: GET /api/trades?account_id=<id> and check the list has length 0.
});

test.fixme("fixture: a winning trade shows on the Trades page", async ({ page, practiceAccount, winningTrade }) => {
  // TODO 1: check winningTrade.account_id equals practiceAccount.id.
  // TODO 2: open /trades/ and click the "All time" button (the trade is dated October 2026).
  // TODO 3: find the row in ".trades-table tbody tr" that has practiceAccount.name, and check it contains
  //         "EURUSD", "+$200.00" and "Pre-journal" (it shows in capitals, but that is only CSS).
});
