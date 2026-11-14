import { test, expect } from "../../support/test";
import { createPracticeAccount, deletePracticeAccount } from "../../support/data";

// Lesson 8 exercise: this test has THREE bugs. Do not guess: use the tools from the README.
//   1. Remove ".fixme" and run it:            npx playwright test lessons/08 --project=exercises
//   2. Open the recording of the failure:     npm run report   (then click the test and "Trace")
//   3. Or step through it live:              npx playwright test lessons/08 --project=exercises --debug
// Fix one bug at a time and run again until it passes. Then compare with solution.spec.ts.

test.fixme("find and fix: the accounts page", async ({ page, request }) => {
  const account = await createPracticeAccount(request);

  await test.step("open the Accounts page", async () => {
    await page.goto("/accounts/");
    await expect(page.getByRole("button", { name: "Add account", exact: true })).toBeVisible();
  });

  await test.step("the new account shows its balance", async () => {
    await expect(page.getByRole("row").filter({ hasText: account.name })).toContainText("10000");
  });

  await test.step("go to the Position size page", async () => {
    await page.getByRole("link", { name: "Calculator" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Position size");
  });

  await deletePracticeAccount(request, account.id);
});
