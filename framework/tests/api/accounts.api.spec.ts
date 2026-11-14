import { test, expect, TAG } from "@fixtures";
import { anAccount } from "@data";
import { uniqueName } from "@utils";

test.describe("Accounts API", { tag: [TAG.API, TAG.REGRESSION] }, () => {
  test("creates an account with the values sent", { tag: TAG.SMOKE }, async ({ data }) => {
    const account = await data.account((a) => a.withFirm("The5ers").withBalance(20_000));

    expect(account.id).toBeGreaterThan(0);
    expect(account).toMatchObject({ firm: "The5ers", starting_balance: 20_000 });
  });

  test("reads back the account it created", async ({ api, data }) => {
    const created = await data.account();

    const read = await api.accounts.get(created.id);

    expect(read.name).toBe(created.name);
  });

  test("updates the profit target", async ({ api, data }) => {
    const account = await data.account((a) => a.withRules({ target: 8 }));

    const updated = await api.accounts.update(account.id, { profit_target_pct: 10 });

    expect(updated.profit_target_pct).toBe(10);
  });

  test("deletes an account: it is gone afterwards", async ({ api, data }) => {
    const account = await data.account();

    await api.accounts.delete(account.id);

    // Look it up by NAME, not by id: the journal's database may give the freed id to the next new account,
    // which another test running at the same time could create a moment later. (A real flaky test this suite had!)
    expect(await api.accounts.findByName(account.name)).toBeUndefined();
  });

  test.describe("refuses bad input", () => {
    test("two accounts cannot share a name (409)", async ({ api, data }) => {
      const first = await data.account();

      const second = await api.accounts.createRaw(anAccount().named(first.name).build());

      expect(second.status()).toBe(409);
      const body = (await second.json()) as { detail: string };
      expect(body.detail).toContain("already exists");
    });

    test("name and starting balance are required (422)", async ({ api }) => {
      const res = await api.accounts.createRaw({ firm: "FundingPips" });

      expect(res.status()).toBe(422);
      const body = (await res.json()) as { detail: { loc: string[] }[] };
      const missing = body.detail.map((d) => d.loc.at(-1));
      expect(missing).toEqual(expect.arrayContaining(["name", "starting_balance"]));
    });

    test("an account that does not exist answers 404", async ({ api }) => {
      expect((await api.accounts.getRaw(999_999_999)).status()).toBe(404);
    });

    test("an unknown phase is refused (422)", async ({ api }) => {
      const res = await api.accounts.createRaw({ ...anAccount().build(), name: uniqueName("BadPhase"), phase: "lunch" });

      expect(res.status()).toBe(422);
    });
  });
});
