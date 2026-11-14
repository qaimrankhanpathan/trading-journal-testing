import { test, expect } from "../../support/test";
import { createPracticeAccount, deletePracticeAccount } from "../../support/data";

// Lesson 8 solution: the fixed version of exercise.spec.ts, plus tools that make failures easy to understand.
// The three bugs in the exercise were:
//   1. the button is "+ Add account", not "Add account" with exact: true
//   2. the Accounts table shows "$10,000.00", not "10000"
//   3. the calculator link in the menu does not exist: the page is reached at /calculator/ (or the "Position size" tab)

test("find and fix: the accounts page", async ({ page, request }) => {
  const account = await createPracticeAccount(request);

  await test.step("open the Accounts page", async () => {
    await page.goto("/accounts/");
    await expect(page.getByRole("button", { name: "+ Add account" })).toBeVisible(); // bug 1 fixed
  });

  await test.step("the new account shows its balance", async () => {
    await expect(page.getByRole("row").filter({ hasText: account.name })).toContainText("$10,000.00"); // bug 2 fixed
  });

  await test.step("go to the Position size page", async () => {
    await page.goto("/calculator/"); // bug 3 fixed
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Position size");
  });

  await deletePracticeAccount(request, account.id);
});

test("attach a screenshot and a note to the report", async ({ page }, testInfo) => {
  await page.goto("/calculator/");
  await testInfo.attach("position size page", { body: await page.screenshot(), contentType: "image/png" });
  testInfo.annotations.push({ type: "note", description: "Open the HTML report (npm run report) to see the screenshot." });
});

test("listen to the browser console", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (err) => problems.push(err.message)); // a JavaScript crash on the page
  page.on("console", (msg) => {
    if (msg.type() === "error") problems.push(msg.text());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(problems, "errors in the browser console").toEqual([]);
});

// To stop in the middle of a test and look around, put this line anywhere and run with --headed or --debug:
//   await page.pause();
