import { test, expect, TAG } from "@fixtures";
import { uniqueName } from "@utils";

// FEATURE: Finding trades: account filter, search, side filter, empty state (docs/TEST_PLAN.md, TC-FLT-*).

test.describe("Trade filters", { tag: [TAG.FUNCTIONAL, TAG.REGRESSION] }, () => {
  test("TC-FLT-01 the account filter shows only that account's trades", async ({ data, tradesPage }) => {
    const mine = await data.account();
    const other = await data.account();
    await data.trade(mine.id);
    await data.trade(mine.id, (t) => t.losing());
    await data.trade(other.id);

    await tradesPage.open();
    await tradesPage.showAccount(mine);

    await expect(tradesPage.rows).toHaveCount(2);
    await expect(tradesPage.rowFor(other.name)).toHaveCount(0);
  });

  test("TC-FLT-02 search finds a trade by a word in its notes", async ({ data, tradesPage }) => {
    const account = await data.account();
    const needle = uniqueName("needle");
    await data.trade(account.id, (t) => t.withNotes(needle));
    await data.trade(account.id, (t) => t.withNotes("something else"));

    await tradesPage.open();
    await tradesPage.showAccount(account);
    await tradesPage.filters.searchFor(needle);

    await expect(tradesPage.rows).toHaveCount(1);
  });

  test("TC-FLT-03 the side filter shows only buys or only sells", async ({ data, tradesPage }) => {
    const account = await data.account();
    await data.trade(account.id, (t) => t.buy());
    await data.trade(account.id, (t) => t.sell());
    await data.trade(account.id, (t) => t.sell().losing());

    await tradesPage.open();
    await tradesPage.showAccount(account);

    await tradesPage.filters.bySide("sell");
    await expect(tradesPage.rows).toHaveCount(2);
    await tradesPage.filters.bySide("buy");
    await expect(tradesPage.rows).toHaveCount(1);
  });

  test("TC-FLT-04 nothing matching shows the empty state and a way back", { tag: TAG.NEGATIVE }, async ({ data, tradesPage }) => {
    const account = await data.account();
    await data.trade(account.id);

    await tradesPage.open();
    await tradesPage.showAccount(account);
    await tradesPage.filters.searchFor(uniqueName("matches-nothing"));

    await expect(tradesPage.rows).toHaveCount(0);
    await expect(tradesPage.emptyState).toContainText("No trades match");
    await expect(tradesPage.showAllTradesButton).toBeVisible();
  });

  test("TC-FLT-05 Clear removes every filter", async ({ data, tradesPage }) => {
    const account = await data.account();
    await data.trade(account.id);

    await tradesPage.open();
    await tradesPage.showAccount(account);
    await tradesPage.filters.searchFor(uniqueName("matches-nothing"));
    await expect(tradesPage.rows).toHaveCount(0);

    await tradesPage.filters.clear();

    await expect(tradesPage.filters.search).toHaveValue("");
    await expect(tradesPage.filters.account).toHaveValue("");
  });
});
