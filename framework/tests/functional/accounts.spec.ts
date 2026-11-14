import { test, expect, TAG } from "@fixtures";
import { uniqueName } from "@utils";

// FEATURE: Accounts (docs/TEST_PLAN.md, TC-ACC-*). Add, list, edit and delete prop firm accounts.

test.describe("Accounts", { tag: [TAG.FUNCTIONAL, TAG.REGRESSION] }, () => {
  test("TC-ACC-01 the table shows an account's firm, phase, platform and start balance", async ({ data, accountsPage }) => {
    const account = await data.account((a) => a.withFirm("The5ers").inPhase("verification").withBalance(25_000));

    await accountsPage.open();

    await expect(accountsPage.cell(account.name, "Firm / program")).toContainText("The5ers");
    await expect(accountsPage.cell(account.name, "Phase")).toContainText(/Phase 2|verification/i);
    await expect(accountsPage.cell(account.name, "Platform")).toHaveText("MT5");
    await expect(accountsPage.cell(account.name, "Start balance")).toShowMoney(25_000);
  });

  test("TC-ACC-02 the Trades column counts the account's trades", async ({ data, accountsPage }) => {
    const account = await data.account();
    await data.trade(account.id);
    await data.trade(account.id, (t) => t.losing());

    await accountsPage.open();

    await expect(accountsPage.cell(account.name, "Trades")).toHaveText("2");
  });

  test("TC-ACC-03 add an account from the catalogue: the firm's rules are filled in", async ({ accountsPage, api, data }) => {
    const name = uniqueName("Ui");
    data.trackAccountName(name);

    await accountsPage.open();
    await accountsPage.addAccount({ firm: "FTMO", size: "100000", name });

    await expect(accountsPage.row(name)).toBeVisible();
    const saved = await api.accounts.findByName(name);
    expect(saved).toMatchObject({ firm: "FTMO", starting_balance: 100_000 });
    expect(saved?.profit_target_pct).toBeGreaterThan(0);
    expect(saved?.max_drawdown_pct).toBeGreaterThan(0);
  });

  test("TC-ACC-04 the program list follows the chosen firm", async ({ accountsPage }) => {
    await accountsPage.open();
    await accountsPage.startAdd();

    await accountsPage.form.fill({ firm: "FundingPips" });
    await expect(accountsPage.form.program.locator("option", { hasText: "2-Step Pro" })).toBeAttached();

    await accountsPage.form.fill({ firm: "FTMO" });
    await expect(accountsPage.form.program.locator("option", { hasText: "2-Step Pro" })).not.toBeAttached();
  });

  test("TC-ACC-05 edit an account's profit target", async ({ data, api, accountsPage }) => {
    const account = await data.account((a) => a.withRules({ target: 8 }));

    await accountsPage.open();
    const form = await accountsPage.edit(account.name);
    await form.fill({ targetPct: "6" });
    await form.save();

    await expect(accountsPage.cell(account.name, "Target")).toContainText("6");
    expect((await api.accounts.get(account.id)).profit_target_pct).toBe(6);
  });

  test("TC-ACC-06 Cancel closes the form and saves nothing", async ({ data, api, accountsPage }) => {
    const account = await data.account((a) => a.withRules({ target: 8 }));

    await accountsPage.open();
    const form = await accountsPage.edit(account.name);
    await form.fill({ targetPct: "3" });
    await form.cancel();

    await expect(form.root).toBeHidden();
    expect((await api.accounts.get(account.id)).profit_target_pct).toBe(8);
  });

  test("TC-ACC-07 delete an account after confirming: it and its trades are gone", async ({ data, api, accountsPage }) => {
    const account = await data.account();
    await data.trade(account.id);

    await accountsPage.open();
    await accountsPage.deleteAccount(account.name, true);

    await expect(accountsPage.row(account.name)).toHaveCount(0);
    expect(await api.accounts.findByName(account.name)).toBeUndefined();
  });

  test.describe("refuses or cancels safely", { tag: TAG.NEGATIVE }, () => {
    test("TC-ACC-08 answering Cancel to the delete question keeps the account", async ({ data, api, accountsPage }) => {
      const account = await data.account();

      await accountsPage.open();
      await accountsPage.deleteAccount(account.name, false);

      await expect(accountsPage.row(account.name)).toBeVisible();
      expect(await api.accounts.findByName(account.name)).toBeDefined();
    });

    test("TC-ACC-09 answering Cancel to 'Add this as a main account?' saves nothing", async ({ api, data, accountsPage }) => {
      const name = uniqueName("Cancelled");
      data.trackAccountName(name); // in case the app saved it anyway: the test fails, but leaves nothing behind

      await accountsPage.open();
      await accountsPage.addAccount({ firm: "FundingPips", name }, false);

      await expect(accountsPage.form.root).toBeVisible();
      expect(await api.accounts.findByName(name)).toBeUndefined();
    });

    test("TC-ACC-10 a second account with the same name is refused with a message", async ({ data, api, accountsPage }) => {
      const existing = await data.account();
      await accountsPage.open();
      await accountsPage.addAccount({ firm: "FundingPips", name: existing.name });

      await expect(accountsPage.form.error.or(accountsPage.pageError)).toContainText("already exists");
      // Count only accounts with this name: other tests add and delete accounts at the same time.
      const sameName = (await api.accounts.list()).filter((a) => a.name.toLowerCase() === existing.name.toLowerCase());
      expect(sameName).toHaveLength(1);
    });

    test("TC-ACC-11 'Other' platform without a name is refused with a message", async ({ api, data, accountsPage }) => {
      const name = uniqueName("NoPlatform");
      data.trackAccountName(name);

      await accountsPage.open();
      await accountsPage.startAdd();
      await accountsPage.form.fill({ firm: "FundingPips", name, platform: "Other (type a name)" });
      await accountsPage.form.save();

      await expect(accountsPage.form.error).toContainText("Type the trading platform name");
      expect(await api.accounts.findByName(name)).toBeUndefined();
    });
  });
});
