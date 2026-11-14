import { test, expect, TAG } from "@fixtures";

test.describe("Position size calculator", { tag: TAG.UI }, () => {
  test("risk on a 10 pip stop stays at or under 1% of the account", { tag: TAG.SMOKE }, async ({ data, calculatorPage }) => {
    const account = await data.account((a) => a.withBalance(10_000));

    await calculatorPage.open();
    await calculatorPage.size({ accountId: account.id, symbol: "EURUSD", side: "Buy", entry: "1.1", stop: "1.099" });

    await expect(calculatorPage.figure("Risk")).toHaveText(/^\$[\d,.]+$/);
    const risk = await calculatorPage.riskDollars();
    expect(risk).toBeGreaterThan(0);
    expect(risk).toBeLessThanOrEqual(100);
  });

  test("a stop on the wrong side of the entry gives no size", { tag: TAG.REGRESSION }, async ({ data, calculatorPage }) => {
    const account = await data.account();

    await calculatorPage.open();
    // A BUY with its stop ABOVE the entry is impossible: the journal must never offer a size for it.
    await calculatorPage.size({ accountId: account.id, symbol: "EURUSD", side: "Buy", entry: "1.1", stop: "1.101" });

    await expect(calculatorPage.figure("Lots")).toHaveText("0");
    await expect(calculatorPage.figure("Risk")).toHaveText("$0.00");
  });
});
