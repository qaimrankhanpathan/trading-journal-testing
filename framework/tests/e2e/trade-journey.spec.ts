import { test, expect, TAG } from "@fixtures";
import { PRE_JOURNAL_DAY } from "@data";

/**
 * END-TO-END: one user journey across several pages, checked on the screen and in the stored data.
 * E2E tests are the slowest and most fragile kind, so a suite has few of them and many API / page tests
 * (the "test pyramid"). Each one should be a journey that really matters to the user.
 */
test.describe("Trader journey", { tag: [TAG.E2E, TAG.REGRESSION] }, () => {
  test("log a winning trade and see it on Trades and on the Dashboard", async ({ data, api, tradesPage, dashboardPage }) => {
    const account = await data.account((a) => a.withBalance(10_000));

    await test.step("log a +20 pip trade through the form", async () => {
      await tradesPage.open();
      await tradesPage.logTrade({
        account: String(account.id),
        symbol: "EURUSD",
        direction: "buy",
        lots: "1",
        openTime: `${PRE_JOURNAL_DAY}T09:00`,
        closeTime: `${PRE_JOURNAL_DAY}T09:45`,
        entry: "1.1",
        exit: "1.102",
        stopLoss: "1.099",
        fees: "0",
      });
      await expect(tradesPage.form.root).toBeHidden();
    });

    await test.step("the trade is listed with +$200", async () => {
      await tradesPage.showAllTime();
      await expect(tradesPage.rowFor(account.name)).toShowMoney(200);
    });

    await test.step("the Dashboard shows the new balance", async () => {
      await dashboardPage.open();
      await expect(dashboardPage.accountCard(account.name)).toContainText("10,200");
    });

    await test.step("the stored trade matches what the screen showed", async () => {
      const [trade] = await api.trades.forAccount(account.id);
      expect(trade.net_pnl).toBeCloseTo(200, 1);
    });
  });
});
