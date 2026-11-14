import { test, expect, TAG } from "@fixtures";

// SMOKE: the Trades page lists a trade with its P&L. The full feature is tests/functional/trades*.spec.ts.

test("a losing trade shows its loss", { tag: [TAG.UI, TAG.SMOKE] }, async ({ data, tradesPage }) => {
  const account = await data.account();
  await data.trade(account.id, (t) => t.losing(10));

  await tradesPage.open();
  await tradesPage.showAccount(account);

  await expect(tradesPage.rowFor(account.name)).toShowMoney(-100);
});
