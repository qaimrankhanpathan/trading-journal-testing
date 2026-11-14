import { test, expect, TAG } from "@fixtures";
import { PRE_JOURNAL_DAY } from "@data";

test.describe("Trades page", { tag: TAG.UI }, () => {
  test("a losing trade shows its loss", { tag: TAG.SMOKE }, async ({ data, tradesPage }) => {
    const account = await data.account();
    await data.trade(account.id, (t) => t.losing(10));

    await tradesPage.open();
    await tradesPage.showAllTime();

    await expect(tradesPage.rowFor(account.name)).toShowMoney(-100);
  });

  test("a winning trade shows its profit", { tag: TAG.REGRESSION }, async ({ data, tradesPage }) => {
    const account = await data.account();
    await data.trade(account.id, (t) => t.winning(20));

    await tradesPage.open();
    await tradesPage.showAllTime();

    await expect(tradesPage.rowFor(account.name)).toShowMoney(200);
  });

  test("log a trade through the form: the journal works out the P&L", { tag: TAG.REGRESSION }, async ({ data, api, tradesPage }) => {
    const account = await data.account();

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
    const saved = await api.trades.forAccount(account.id);
    expect(saved).toHaveLength(1);
    expect(saved[0].net_pnl).toBeCloseTo(200, 1);
  });
});
