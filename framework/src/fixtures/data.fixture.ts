import { test as base } from "@playwright/test";
import { JournalApi } from "../api";
import { DataFactory } from "../data/DataFactory";

/**
 * API + DATA fixtures.
 *
 *   api   the typed API client: api.accounts.create(...), api.trades.forAccount(...)
 *   data  the data factory: data.account(), data.trade(id). Everything it creates is deleted after the test.
 *
 * The code after `await use(...)` is the TEARDOWN. Playwright runs it after the test even if the test failed,
 * so the test copy never fills up with leftovers and tests stay independent of each other.
 */
export const test = base.extend<{ api: JournalApi; data: DataFactory }>({
  api: async ({ request }, use) => {
    await use(new JournalApi(request));
  },

  data: async ({ api }, use) => {
    const factory = new DataFactory(api);
    await use(factory);
    await factory.cleanUp();
  },
});
