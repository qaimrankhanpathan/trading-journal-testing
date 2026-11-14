import { test as base, expect } from "@playwright/test";

/**
 * Use this instead of "@playwright/test" in every lesson:
 *
 *   import { test, expect } from "../../support/test";
 *
 * It is exactly Playwright's own `test` and `expect`, plus one safety net: the browser is not allowed to open
 * anything on port 8000 (your real journal), even if a test types that address by mistake.
 * Lesson 6 explains how this works (it is an "automatic fixture").
 */
export const test = base.extend<{ realJournalGuard: void }>({
  realJournalGuard: [
    async ({ context }, use) => {
      for (const host of ["localhost", "127.0.0.1"]) {
        await context.route(`http://${host}:8000/**`, (route) => route.abort("blockedbyclient"));
      }
      await use();
    },
    { auto: true },
  ],
});

export { expect };
