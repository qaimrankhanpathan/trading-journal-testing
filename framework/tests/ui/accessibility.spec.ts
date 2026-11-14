import AxeBuilder from "@axe-core/playwright";
import { test, expect, TAG } from "@fixtures";

/**
 * ACCESSIBILITY: axe-core checks each page against the WCAG rules (labels, contrast, headings, keyboard use...).
 *
 * The test fails only on "critical" problems, and attaches the full list of findings to the HTML report.
 * That is a common way to bring a11y checks into an existing app: stop it getting worse first, fix the rest over time.
 */
const PAGES = ["/", "/trades/", "/accounts/", "/calculator/"];

test.describe("Accessibility", { tag: [TAG.UI, TAG.A11Y, TAG.REGRESSION] }, () => {
  for (const path of PAGES) {
    test(`${path} has no critical accessibility problems`, async ({ data, page }, testInfo) => {
      await data.account(); // the Dashboard shows a welcome card instead of its heading when there are no accounts
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      await testInfo.attach("axe-results.json", { body: JSON.stringify(results.violations, null, 2), contentType: "application/json" });

      const critical = results.violations
        .filter((v) => v.impact === "critical")
        .map((v) => `${v.id}: ${v.help} (${v.nodes.length} places)`);
      expect(critical, "critical accessibility problems").toEqual([]);
    });
  }
});
