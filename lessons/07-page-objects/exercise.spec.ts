import { type Locator, type Page } from "@playwright/test";
import { test as base, expect } from "../../support/test";
import { createPracticeAccount, deletePracticeAccount, type Account } from "../../support/data";

// Lesson 7 exercise: build your own page object for the Position size page.
// (A finished set of page objects is in ./pages. Try first, then compare.) Remove ".fixme" to run a test.

class MyCalculatorPage {
  readonly entry: Locator;
  // TODO 1: add readonly locators for account, symbol and stopLoss (use page.getByLabel).

  constructor(readonly page: Page) {
    this.entry = page.getByLabel("Entry");
    // TODO 2: set account, symbol and stopLoss here.
  }

  async open() {
    await this.page.goto("/calculator/");
  }

  /** The <b> figure next to a label in the Result card. */
  figure(label: "Lots" | "Risk") {
    return this.page.locator(`div:has(> span:text-is('${label}')) > b`);
  }

  async size(accountId: number, entry: string, stop: string) {
    // TODO 3: choose the account, choose EURUSD, click Buy, fill entry and stop.
  }
}

const test = base.extend<{ calc: MyCalculatorPage; practiceAccount: Account }>({
  calc: async ({ page }, use) => use(new MyCalculatorPage(page)),
  practiceAccount: async ({ request }, use) => {
    const account = await createPracticeAccount(request);
    await use(account);
    await deletePracticeAccount(request, account.id);
  },
});

test.fixme("a 10 pip stop gives a size and a risk of at most $100", async ({ calc, practiceAccount }) => {
  await calc.open();
  await calc.size(practiceAccount.id, "1.1", "1.099");
  // TODO 4: check figure("Lots") shows a number above 0, and figure("Risk") shows a dollar amount.
  //         Hint: read with innerText() and convert with Number(...).
});

test.fixme("a stop on the wrong side of the entry gives no size", async ({ calc, practiceAccount }) => {
  await calc.open();
  await calc.size(practiceAccount.id, "1.1", "1.101"); // a BUY with the stop ABOVE the entry is impossible
  // TODO 5: the journal must never give a size here. Check figure("Lots") shows "0".
  //         Then open this test in UI mode (npm run ui) and look at what else the Result card says.
});
