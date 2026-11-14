import { expect as baseExpect, mergeTests } from "@playwright/test";
import { test as dataTest } from "./data.fixture";
import { test as pagesTest } from "./pages.fixture";
import { test as safetyTest } from "./safety.fixture";
import { moneyPattern } from "../utils/money";

/**
 * THE ONE IMPORT FOR EVERY TEST:
 *
 *   import { test, expect } from "@fixtures";
 *
 * mergeTests() joins the small fixture files into one `test`. Each file has one job (safety, data, pages), so a new
 * team member can read them one at a time, and you can add a new group (say, a logged-in user) without touching
 * the others.
 */
export const test = mergeTests(safetyTest, dataTest, pagesTest);

/**
 * CUSTOM MATCHERS: expect() plus checks written in the language of this app.
 *
 *   await expect(row).toShowMoney(-100);     // passes for "−$100.00" and "-$100.00"
 */
export const expect = baseExpect.extend({
  async toShowMoney(locator: import("@playwright/test").Locator, amount: number, options?: { timeout?: number }) {
    const pattern = moneyPattern(amount);
    let pass = true;
    let shown = "";
    try {
      await baseExpect(locator).toContainText(pattern, { timeout: options?.timeout });
    } catch {
      pass = false;
      shown = await locator.innerText().catch(() => "(not found)");
    }
    return {
      pass,
      name: "toShowMoney",
      message: () => (pass ? `expected not to show ${pattern}` : `expected to show ${pattern}\nshown: ${shown}`),
    };
  },
});

export { TAG } from "./tags";
