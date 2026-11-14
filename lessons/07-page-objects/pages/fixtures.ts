import { test as base } from "../../../support/test";
import { createPracticeAccount, deletePracticeAccount, type Account } from "../../../support/data";
import { AccountsPage } from "./AccountsPage";
import { CalculatorPage } from "./CalculatorPage";
import { TradesPage } from "./TradesPage";

/** Every test can ask for a page object (and a practice account) by name. */
export const test = base.extend<{
  accountsPage: AccountsPage;
  calculatorPage: CalculatorPage;
  tradesPage: TradesPage;
  practiceAccount: Account;
}>({
  accountsPage: async ({ page }, use) => use(new AccountsPage(page)),
  calculatorPage: async ({ page }, use) => use(new CalculatorPage(page)),
  tradesPage: async ({ page }, use) => use(new TradesPage(page)),
  practiceAccount: async ({ request }, use) => {
    const account = await createPracticeAccount(request);
    await use(account);
    await deletePracticeAccount(request, account.id);
  },
});

export { expect } from "@playwright/test";
