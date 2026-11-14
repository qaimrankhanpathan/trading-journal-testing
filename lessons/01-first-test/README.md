# Lesson 1: Your first test

## What is Playwright?

Playwright opens a real browser (Edge for us), does what a person would do (open pages, click, type) and checks
the result. A **test** is a small TypeScript function that does that. If a check fails, the test fails and
Playwright tells you exactly where and why.

## Anatomy of a test

```ts
import { test, expect } from "../../support/test"; // Playwright's test + expect, with our port-8000 safety net

test("the Dashboard opens", async ({ page }) => {   // a name, and a function that gets a browser tab: `page`
  await page.goto("/");                             // open http://localhost:8001/
  await expect(page).toHaveTitle("Trading Journal"); // check the browser tab title
});
```

- `async` / `await`: every browser step takes time, so we `await` it (wait for it to finish).
- `page` is a **fixture**: Playwright gives each test a fresh browser tab. (More in lesson 6.)
- `"/"` works because `playwright.config.ts` sets `baseURL` to `http://localhost:8001`.
- `expect(...)` is a **check** (an assertion). Playwright checks keep retrying for up to 5 seconds, so you
  almost never need to "wait" yourself.

## Run it

1. Start the test copy with **start-test.bat**.
2. Run: `npx playwright test lessons/01 --project=exercises`

You will see `1 passed` and `2 skipped`. Skipped tests are marked `test.fixme(...)`: that is your exercise.

To watch the browser while the test runs, add `--headed`. To watch it step by step, run `npm run ui` and press the
play button next to a test. You will meet UI mode properly in lesson 8.

## Exercise

Open `exercise.spec.ts`, remove `.fixme` from the second test and fill in the TODOs. Run again. Then the third test.

New tools for the exercise:

- `page.getByText("TEST COPY")` finds the element that shows that text.
- `page.getByRole("heading", { level: 1 })` finds the page's main heading (the `<h1>`).
- `await expect(locator).toBeVisible()` and `await expect(locator).toContainText("...")`.

## If something goes wrong

- *Cannot reach the journal test copy*: start-test.bat is not running, or it is still starting.
- *STOP: ... is not the journal TEST COPY*: something else is on port 8001. Close it and use start-test.bat.
- *Executable doesn't exist / msedge*: Edge is missing; use Chromium (see the main README).
