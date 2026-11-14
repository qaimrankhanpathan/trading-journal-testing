import { test, expect, TAG } from "@fixtures";
import { ALL_PAGES } from "@pages";

// FEATURE: Every page opens (docs/TEST_PLAN.md, TC-PG-*). One test per page, from the list in src/pages/catalog.ts.
// The safety fixture also fails a test if the page throws a JavaScript error, so these tests catch crashes that
// still "look fine".

test.describe("Page health", { tag: [TAG.FUNCTIONAL, TAG.REGRESSION] }, () => {
  // The Dashboard shows a welcome card instead of its heading when there are no accounts: make sure there is one.
  test.beforeEach(async ({ data }) => {
    await data.account();
  });

  for (const { path, heading } of ALL_PAGES) {
    test(`TC-PG-01 ${path} opens with its heading and no errors`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    });
  }

  test("TC-PG-02 an address that does not exist answers 404, not a crash", { tag: TAG.NEGATIVE }, async ({ page }) => {
    const response = await page.goto("/no-such-page/");

    expect(response?.status()).toBe(404);
  });
});
