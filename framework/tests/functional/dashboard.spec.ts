import { test, expect, TAG } from "@fixtures";

// FEATURE: Dashboard account book (docs/TEST_PLAN.md, TC-DSH-*). Figures for a $10,000 account with an 8% target,
// 5% daily loss limit and 10% max drawdown (the AccountBuilder defaults).

test.describe("Dashboard", { tag: [TAG.FUNCTIONAL, TAG.REGRESSION] }, () => {
  test("TC-DSH-01 a new account is listed with its starting balance and full drawdown room", async ({ data, dashboardPage }) => {
    const account = await data.account();

    await dashboardPage.open();

    await expect(dashboardPage.figure(account.name, "Account")).toContainText("FundingPips");
    await expect(dashboardPage.figure(account.name, "Balance")).toShowMoney(10_000);
    await expect(dashboardPage.figure(account.name, "Drawdown room")).toShowMoney(1_000);
  });

  test("TC-DSH-02 a winning trade raises the balance and the progress to target", async ({ data, dashboardPage }) => {
    const account = await data.account();
    await data.trade(account.id, (t) => t.winning(20)); // +$200 of an $800 target

    await dashboardPage.open();

    await expect(dashboardPage.figure(account.name, "Balance")).toShowMoney(10_200);
    await expect(dashboardPage.figure(account.name, "Profit target")).toContainText("25%");
  });

  test("TC-DSH-03 a losing trade lowers the balance and the drawdown room", async ({ data, dashboardPage }) => {
    const account = await data.account();
    await data.trade(account.id, (t) => t.losing(10)); // -$100

    await dashboardPage.open();

    await expect(dashboardPage.figure(account.name, "Balance")).toShowMoney(9_900);
    await expect(dashboardPage.figure(account.name, "Drawdown room")).toShowMoney(900);
  });

  test("TC-DSH-04 the stage shows the account's phase", async ({ data, dashboardPage }) => {
    const challenge = await data.account((a) => a.inPhase("challenge"));
    const verification = await data.account((a) => a.inPhase("verification"));

    await dashboardPage.open();

    await expect(dashboardPage.figure(challenge.name, "Stage")).toHaveText("Phase 1");
    await expect(dashboardPage.figure(verification.name, "Stage")).toHaveText("Phase 2");
  });

  test("TC-DSH-05 a deleted account disappears from the dashboard", async ({ data, api, dashboardPage }) => {
    const account = await data.account();
    await dashboardPage.open();
    await expect(dashboardPage.accountCard(account.name)).toBeVisible();

    await api.accounts.delete(account.id);
    await dashboardPage.open();

    await expect(dashboardPage.accountCard(account.name)).toHaveCount(0);
  });
});
