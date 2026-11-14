import { test, expect } from "../../support/test";

// Lesson 9 solution: tags, groups, skipping, and the phone project.
//   Only smoke tests:       npx playwright test --project=solutions --grep @smoke
//   Everything but slow:     npx playwright test --project=solutions --grep-invert @slow
//   Phone-sized screen:      npx playwright test --project=phone

const PAGES: [string, string][] = [
  ["/", "Dashboard"],
  ["/trades/", "Trades"],
  ["/accounts/", "Accounts"],
  ["/calculator/", "Position size"],
  ["/settings/", "Settings"],
];

test.describe("smoke: every main page opens", { tag: "@smoke" }, () => {
  // One test per page, made in a loop. Each one shows up separately in the report.
  for (const [path, heading] of PAGES) {
    test(`${path} opens`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    });
  }
});

test.describe("phone", { tag: "@phone" }, () => {
  for (const [path] of PAGES) {
    test(`${path} has no sideways scrolling`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "only meaningful on a phone-sized screen: run with --project=phone");
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const tooWide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(tooWide).toBeLessThanOrEqual(1);
    });
  }
});

test("a slow check, left out of quick runs", { tag: "@slow" }, async ({ page }) => {
  test.slow(); // gives this test three times the normal time limit
  for (const [path] of PAGES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
});

test.describe("parallel group", () => {
  // These tests do not share anything, so they may run at the same time (with more than one worker).
  test.describe.configure({ mode: "parallel" });
  test("reads accounts", async ({ request }) => expect((await request.get("/api/accounts")).ok()).toBeTruthy());
  test("reads trades", async ({ request }) => expect((await request.get("/api/trades")).ok()).toBeTruthy());
});
