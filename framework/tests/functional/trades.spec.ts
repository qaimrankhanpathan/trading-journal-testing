import { test, expect, TAG } from "@fixtures";
import { PRE_JOURNAL_DAY } from "@data";

// FEATURE: Logging, editing and deleting trades (docs/TEST_PLAN.md, TC-TRD-*).

const AT = (time: string) => `${PRE_JOURNAL_DAY}T${time}`;

test.describe("Trades: log, edit, delete", { tag: [TAG.FUNCTIONAL, TAG.REGRESSION] }, () => {
  test("TC-TRD-01 log a buy through the form: saved with the P&L worked out", async ({ data, api, tradesPage }) => {
    const account = await data.account();

    await tradesPage.open();
    await tradesPage.logTrade({
      account: String(account.id),
      symbol: "EURUSD",
      direction: "buy",
      lots: "1",
      openTime: AT("09:00"),
      closeTime: AT("09:45"),
      entry: "1.1",
      exit: "1.102",
      stopLoss: "1.099",
      fees: "0",
    });

    await expect(tradesPage.form.root).toBeHidden();
    const [saved] = await api.trades.forAccount(account.id);
    expect(saved).toMatchObject({ symbol: "EURUSD", side: "buy", lots: 1 });
    expect(saved.net_pnl).toBeCloseTo(200, 1);
  });

  test("TC-TRD-02 log a sell: a fall in price is a profit", async ({ data, api, tradesPage }) => {
    const account = await data.account();

    await tradesPage.open();
    await tradesPage.logTrade({
      account: String(account.id),
      symbol: "EURUSD",
      direction: "sell",
      lots: "0.5",
      openTime: AT("10:00"),
      closeTime: AT("11:00"),
      entry: "1.1",
      exit: "1.098",
      stopLoss: "1.101",
      fees: "0",
    });

    await expect(tradesPage.form.root).toBeHidden();
    const [saved] = await api.trades.forAccount(account.id);
    expect(saved.net_pnl).toBeCloseTo(100, 1); // 20 pips x 0.5 lots x $10
  });

  test("TC-TRD-03 fees are taken off the P&L", async ({ data, api, tradesPage }) => {
    const account = await data.account();

    await tradesPage.open();
    await tradesPage.logTrade({
      account: String(account.id),
      symbol: "EURUSD",
      direction: "buy",
      lots: "1",
      openTime: AT("09:00"),
      closeTime: AT("09:45"),
      entry: "1.1",
      exit: "1.102",
      stopLoss: "1.099",
      fees: "7",
    });

    await expect(tradesPage.form.root).toBeHidden();
    const [saved] = await api.trades.forAccount(account.id);
    expect(saved.net_pnl).toBeCloseTo(193, 1);
  });

  test("TC-TRD-04 a trade with no exit is saved as still open", async ({ data, api, tradesPage }) => {
    const account = await data.account();

    await tradesPage.open();
    const form = await tradesPage.startLogTrade();
    await form.fill({
      account: String(account.id),
      symbol: "EURUSD",
      direction: "buy",
      lots: "1",
      openTime: AT("09:00"),
      entry: "1.1",
      stopLoss: "1.099",
      fees: "0",
    });
    await form.save();

    await expect(form.root).toBeHidden();
    const [saved] = await api.trades.forAccount(account.id);
    expect(saved.exit_price).toBeNull();
    expect(saved.net_pnl).toBeNull();
  });

  test("TC-TRD-05 edit a trade's exit price: the P&L is worked out again", async ({ data, api, tradesPage }) => {
    const account = await data.account();
    await data.trade(account.id, (t) => t.winning(20));

    await tradesPage.open();
    await tradesPage.showAccount(account);
    const form = await tradesPage.editTrade(tradesPage.rows.first());
    await form.fill({ exit: "1.101" });
    await form.save();

    await expect(form.root).toBeHidden();
    await expect(tradesPage.rowFor(account.name)).toShowMoney(100);
    expect((await api.trades.forAccount(account.id))[0].net_pnl).toBeCloseTo(100, 1);
  });

  test("TC-TRD-06 delete a trade after confirming", async ({ data, api, tradesPage }) => {
    const account = await data.account();
    await data.trade(account.id);

    await tradesPage.open();
    await tradesPage.showAccount(account);
    await tradesPage.deleteTrade(tradesPage.rows.first(), true);

    await expect(tradesPage.rows).toHaveCount(0);
    expect(await api.trades.forAccount(account.id)).toHaveLength(0);
  });

  test("TC-TRD-07 answering Cancel to the delete question keeps the trade", { tag: TAG.NEGATIVE }, async ({ data, api, tradesPage }) => {
    const account = await data.account();
    await data.trade(account.id);

    await tradesPage.open();
    await tradesPage.showAccount(account);
    await tradesPage.deleteTrade(tradesPage.rows.first(), false);

    await expect(tradesPage.drawer.root).toBeVisible();
    expect(await api.trades.forAccount(account.id)).toHaveLength(1);
  });
});

test.describe("Trades: the form refuses bad input", { tag: [TAG.FUNCTIONAL, TAG.NEGATIVE, TAG.REGRESSION] }, () => {
  test("TC-TRD-08 a close time before the open time shows an error and saves nothing", async ({ data, api, tradesPage }) => {
    const account = await data.account();

    await tradesPage.open();
    const form = await tradesPage.startLogTrade();
    await form.fill({
      account: String(account.id),
      symbol: "EURUSD",
      lots: "1",
      openTime: AT("10:00"),
      closeTime: AT("09:00"),
      entry: "1.1",
      exit: "1.102",
      stopLoss: "1.099",
    });
    await form.save();

    await expect(form.error).toContainText(/before/i);
    await expect(form.root).toBeVisible();
    expect(await api.trades.forAccount(account.id)).toHaveLength(0);
  });

  test("TC-TRD-09 an impossible lot size is refused with a message", async ({ data, api, tradesPage }) => {
    const account = await data.account();

    await tradesPage.open();
    const form = await tradesPage.startLogTrade();
    await form.fill({
      account: String(account.id),
      symbol: "EURUSD",
      lots: "5000",
      openTime: AT("09:00"),
      entry: "1.1",
      stopLoss: "1.099",
    });
    await form.save();

    await expect(form.error).toContainText(/1000 lots/);
    expect(await api.trades.forAccount(account.id)).toHaveLength(0);
  });

  test("TC-TRD-10 missing lots keeps the form open and saves nothing", async ({ data, api, tradesPage }) => {
    const account = await data.account();

    await tradesPage.open();
    const form = await tradesPage.startLogTrade();
    await form.fill({ account: String(account.id), symbol: "EURUSD", lots: "", openTime: AT("09:00"), entry: "1.1" });
    await form.save();

    await expect(form.root).toBeVisible(); // the browser itself blocks a form with an empty required field
    expect(await api.trades.forAccount(account.id)).toHaveLength(0);
  });

  test("TC-TRD-11 closing the form without saving saves nothing", async ({ data, api, tradesPage }) => {
    const account = await data.account();

    await tradesPage.open();
    const form = await tradesPage.startLogTrade();
    await form.fill({ account: String(account.id), symbol: "EURUSD", lots: "1", openTime: AT("09:00"), entry: "1.1" });
    await form.closeButton.click();

    await expect(form.root).toBeHidden();
    expect(await api.trades.forAccount(account.id)).toHaveLength(0);
  });
});
