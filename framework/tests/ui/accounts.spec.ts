import { test, expect, TAG } from "@fixtures";
import { uniqueName } from "@utils";

test.describe("Accounts page", { tag: TAG.UI }, () => {
  test("an account made through the API is listed with its balance", { tag: TAG.SMOKE }, async ({ data, accountsPage }) => {
    const account = await data.account((a) => a.withBalance(10_000));

    await accountsPage.open();

    await expect(accountsPage.row(account.name)).toShowMoney(10_000);
  });

  test("add an account from the prop firm catalogue", { tag: TAG.REGRESSION }, async ({ accountsPage, api, data }) => {
    const name = uniqueName("Ui");
    data.trackAccountName(name); // created through the screen, so tell the clean-up about it

    await accountsPage.open();
    await accountsPage.addAccount({ firm: "FTMO", size: "100000", name });

    // Check the screen AND the stored data: a form can look saved while the server stored something else.
    await expect(accountsPage.row(name)).toBeVisible();
    const saved = await api.accounts.findByName(name);
    expect(saved?.firm).toBe("FTMO");
    expect(saved?.starting_balance).toBe(100_000);
    expect(saved?.profit_target_pct).toBeGreaterThan(0);
  });
});
