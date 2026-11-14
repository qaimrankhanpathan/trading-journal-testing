import { test, expect, TAG } from "@fixtures";

// FEATURE: Display preferences in the side menu (docs/TEST_PLAN.md, TC-PRF-*). They live in the browser, and every
// test gets a fresh browser context, so these tests never change anything for other tests or for you.

test.describe("Display preferences", { tag: [TAG.FUNCTIONAL, TAG.REGRESSION] }, () => {
  test("TC-PRF-01 the theme button switches between light and dark", async ({ tradesPage }) => {
    await tradesPage.open();
    const before = await tradesPage.menu.currentTheme();

    await tradesPage.menu.toggleTheme();

    await expect(tradesPage.page.locator("html")).not.toHaveAttribute("data-theme", before ?? "");
  });

  test("TC-PRF-02 the chosen theme is remembered after a reload", async ({ tradesPage }) => {
    await tradesPage.open();
    await tradesPage.menu.toggleTheme();
    const chosen = await tradesPage.menu.currentTheme();

    await tradesPage.page.reload();

    await expect(tradesPage.page.locator("html")).toHaveAttribute("data-theme", chosen ?? "");
  });

  test("TC-PRF-03 Larger text zooms the page, and the reset button brings it back to 100%", async ({ tradesPage }) => {
    await tradesPage.open();
    // The journal scales every page with one CSS variable, --text-zoom (1 = 100%).
    const zoom = () =>
      tradesPage.page.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue("--text-zoom") || 1));

    await tradesPage.menu.largerText.click();
    await expect(tradesPage.menu.textSizeReset).toHaveText("110%");
    await expect.poll(zoom).toBe(1.1);

    await tradesPage.menu.textSizeReset.click();
    await expect(tradesPage.menu.textSizeReset).toHaveText("100%");
    await expect.poll(zoom).toBe(1);
  });

  test("TC-PRF-04 the chosen text size is remembered after a reload", async ({ tradesPage }) => {
    await tradesPage.open();
    await tradesPage.menu.largerText.click();
    await tradesPage.menu.largerText.click();

    await tradesPage.page.reload();

    await expect(tradesPage.menu.textSizeReset).toHaveText("120%");
  });
});
