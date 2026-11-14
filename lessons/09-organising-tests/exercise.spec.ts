import { test, expect } from "../../support/test";

// Lesson 9 exercise: organise tests. Remove ".fixme" to run a test.

const PAGES: [string, string][] = [
  ["/", "Dashboard"],
  ["/trades/", "Trades"],
  ["/accounts/", "Accounts"],
  ["/calculator/", "Position size"],
  ["/settings/", "Settings"],
];

// TODO 1: wrap this in test.describe("smoke: every main page opens", { tag: "@smoke" }, () => { ... })
//         and make one test per page with a for loop over PAGES, checking the h1 heading.
//         Run only these with:  npx playwright test --project=exercises --grep @smoke
test.fixme("smoke placeholder", async () => {});

test.fixme("no sideways scrolling on a phone", { tag: "@phone" }, async ({ page, isMobile }) => {
  // TODO 2: skip this test when !isMobile, with a reason.
  // TODO 3: open /accounts/, then work out
  //         document.documentElement.scrollWidth - document.documentElement.clientWidth with page.evaluate(...)
  //         and check it is at most 1.
  // TODO 4: the "phone" project only runs solution files. Add a "phone-exercises" project to playwright.config.ts
  //         (copy the "phone" one, change testMatch to "**/exercise.spec.ts") and run it.
});
