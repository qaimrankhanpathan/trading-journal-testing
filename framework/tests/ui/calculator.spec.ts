import { test, expect, TAG } from "@fixtures";

// SMOKE: the calculator gives a size. The full feature is tests/functional/calculator.spec.ts.

test("risk on a 10 pip stop stays at or under 1% of the account", { tag: [TAG.UI, TAG.SMOKE] }, async ({ data, calculatorPage }) => {
  const account = await data.account((a) => a.withBalance(10_000));

  await calculatorPage.open();
  await calculatorPage.size({ accountId: account.id, symbol: "EURUSD", side: "Buy", entry: "1.1", stop: "1.099" });

  await expect(calculatorPage.figure("Risk")).toHaveText(/^\$[\d,.]+$/);
  const risk = await calculatorPage.riskDollars();
  expect(risk).toBeGreaterThan(0);
  expect(risk).toBeLessThanOrEqual(100);
});
