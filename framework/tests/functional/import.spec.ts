import { test, expect, TAG } from "@fixtures";
import { PRE_JOURNAL_DAY } from "@data";

// FEATURE: CSV import (docs/TEST_PLAN.md, TC-IMP-*). The CSV is made in memory: no file on disk is needed.

const HEADER = "symbol,side,open_time,close_time,entry_price,exit_price,lots,stop_loss";
const csv = (...rows: string[]) => [HEADER, ...rows].join("\n") + "\n";

test.describe("CSV import", { tag: [TAG.FUNCTIONAL, TAG.REGRESSION] }, () => {
  test("TC-IMP-01 a valid CSV imports its trades into the chosen account", async ({ data, api, importPage }) => {
    const account = await data.account();
    const file = csv(
      `EURUSD,buy,${PRE_JOURNAL_DAY} 09:00,${PRE_JOURNAL_DAY} 10:00,1.1,1.102,1,1.099`,
      `EURUSD,sell,${PRE_JOURNAL_DAY} 11:00,${PRE_JOURNAL_DAY} 12:00,1.1,1.101,1,1.101`,
    );

    await importPage.open();
    await importPage.importCsv(account.id, "trades.csv", file);

    await expect(importPage.csvResult).toContainText("2");
    const trades = await api.trades.forAccount(account.id);
    expect(trades).toHaveLength(2);
    // The CSV has no fees column, so the journal charges the firm's commission: FundingPips is $5 per lot on forex.
    // (+$200 - $5 = $195 and -$100 - $5 = -$105.) Found by this test: the API test sends fees: 0 and never sees it.
    expect(trades.map((t) => t.net_pnl).sort((a, b) => a! - b!)).toEqual([expect.closeTo(-105, 1), expect.closeTo(195, 1)]);
  });

  test(
    "TC-IMP-02 a file without the required columns shows an error and imports nothing",
    { tag: TAG.NEGATIVE },
    async ({ data, api, importPage }) => {
      const account = await data.account();

      await importPage.open();
      await importPage.importCsv(account.id, "bad.csv", "hello,world\n1,2\n");

      await expect(importPage.csvError).toContainText(/Missing required column/);
      expect(await api.trades.forAccount(account.id)).toHaveLength(0);
    },
  );
});
