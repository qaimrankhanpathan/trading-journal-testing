import { test, expect, TAG } from "@fixtures";

// FEATURE: Position size calculator (docs/TEST_PLAN.md, TC-CAL-*).

test.describe("Position size calculator", { tag: [TAG.FUNCTIONAL, TAG.REGRESSION] }, () => {
  test("TC-CAL-01 a buy with a 10 pip stop risks more than $0 and at most 1% of $10,000", async ({ data, calculatorPage }) => {
    const account = await data.account();

    await calculatorPage.open();
    await calculatorPage.size({ accountId: account.id, symbol: "EURUSD", side: "Buy", entry: "1.1", stop: "1.099" });

    await expect(calculatorPage.figure("Risk")).toHaveText(/^\$[\d,.]+$/);
    const risk = await calculatorPage.riskDollars();
    expect(risk).toBeGreaterThan(0);
    expect(risk).toBeLessThanOrEqual(100);
  });

  test("TC-CAL-02 a sell with its stop above the entry gets a size", async ({ data, calculatorPage }) => {
    const account = await data.account();

    await calculatorPage.open();
    await calculatorPage.size({ accountId: account.id, symbol: "EURUSD", side: "Sell", entry: "1.1", stop: "1.101" });

    await expect(calculatorPage.figure("Lots")).not.toHaveText("0");
    expect(await calculatorPage.lots()).toBeGreaterThan(0);
  });

  test("TC-CAL-03 a stop twice as far away gives about half the lots", async ({ data, calculatorPage }) => {
    const account = await data.account();
    await calculatorPage.open();

    await calculatorPage.size({ accountId: account.id, symbol: "EURUSD", side: "Buy", entry: "1.1", stop: "1.099" });
    await expect(calculatorPage.figure("Lots")).not.toHaveText("0");
    const tenPips = await calculatorPage.lots();

    await calculatorPage.stopLoss.fill("1.098");
    await expect(calculatorPage.figure("Lots")).not.toHaveText(String(tenPips));
    const twentyPips = await calculatorPage.lots();

    expect(twentyPips).toBeCloseTo(tenPips / 2, 1);
  });

  test.describe("refuses impossible stops", { tag: TAG.NEGATIVE }, () => {
    for (const stop of ["1.101", "1.1"]) {
      test(`TC-CAL-04 a buy at 1.1 with its stop at ${stop} gives no size`, async ({ data, calculatorPage }) => {
        const account = await data.account();

        await calculatorPage.open();
        await calculatorPage.size({ accountId: account.id, symbol: "EURUSD", side: "Buy", entry: "1.1", stop });

        // Either no figures at all (an explanation instead), or 0 lots: never a real size.
        await expect(calculatorPage.figure("Lots").or(calculatorPage.noResult)).toBeVisible();
        expect(await calculatorPage.lotsOrZero()).toBe(0);
      });
    }
  });
});
