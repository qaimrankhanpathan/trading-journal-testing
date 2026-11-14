import { test, expect, TAG } from "@fixtures";
import { aTrade } from "@data";
import { uniqueName } from "@utils";
import pnlCases from "../../test-data/trade-pnl.json";

test.describe("Trades API", { tag: [TAG.API, TAG.REGRESSION] }, () => {
  // DATA-DRIVEN TEST: one test per row of test-data/trade-pnl.json. To check a new case, add a row to the
  // JSON file: no new code. Each row shows up as its own test in the report, so you see exactly which case broke.
  for (const c of pnlCases) {
    test(`P&L: ${c.case} = ${c.expectedPnl}`, async ({ data }) => {
      const account = await data.account();

      const trade = await data.trade(account.id, (t) => {
        const sided = c.side === "buy" ? t.buy() : t.sell();
        return (c.pips >= 0 ? sided.winning(c.pips) : sided.losing(-c.pips)).lots(c.lots);
      });

      expect(trade.net_pnl).toBeCloseTo(c.expectedPnl, 2);
    });
  }

  test("an open trade has no P&L yet", async ({ data }) => {
    const account = await data.account();

    const trade = await data.trade(account.id, (t) => t.open());

    expect(trade.exit_price).toBeNull();
    expect(trade.net_pnl).toBeNull();
  });

  test("lists only the trades of the account asked for", { tag: TAG.SMOKE }, async ({ api, data }) => {
    const mine = await data.account();
    const other = await data.account();
    await data.trade(mine.id);
    await data.trade(mine.id, (t) => t.losing());
    await data.trade(other.id);

    const trades = await api.trades.forAccount(mine.id);

    expect(trades).toHaveLength(2);
    expect(trades.every((t) => t.account_id === mine.id)).toBe(true);
  });

  test("deleting an account deletes its trades", async ({ api, data }) => {
    const account = await data.account();
    const note = uniqueName("Note");
    const trade = await data.trade(account.id, (t) => t.withNotes(note));

    await api.accounts.delete(account.id);

    // The freed trade id may already belong to a new trade from a test running in parallel,
    // so "gone" means: no trade with this id, or a different trade (not our note) under it.
    expect((await api.trades.find(trade.id))?.notes).not.toBe(note);
  });

  test.describe("refuses bad input", () => {
    test("zero lots (422)", async ({ api, data }) => {
      const account = await data.account();

      const res = await api.trades.createRaw(aTrade(account.id).lots(0).build());

      expect(res.status()).toBe(422);
    });

    test("an account that does not exist", async ({ api }) => {
      const res = await api.trades.createRaw(aTrade(999_999_999).build());

      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);
    });
  });
});
