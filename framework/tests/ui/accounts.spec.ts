import { test, expect, TAG } from "@fixtures";

// SMOKE: the Accounts page lists accounts. The full feature is tests/functional/accounts.spec.ts.

test("an account made through the API is listed with its balance", { tag: [TAG.UI, TAG.SMOKE] }, async ({ data, accountsPage }) => {
  const account = await data.account((a) => a.withBalance(10_000));

  await accountsPage.open();

  await expect(accountsPage.row(account.name)).toShowMoney(10_000);
});
