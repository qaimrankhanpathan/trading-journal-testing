import { test as base, expect } from "@playwright/test";

/**
 * SAFETY + QUALITY: these OVERRIDE Playwright's own `context` and `page` fixtures, so every test that opens a browser
 * gets them without asking, and API-only tests never start a browser at all.
 *
 * context: the browser may not open anything on port 8000 (your real journal), even by mistake.
 * page:    a test FAILS if the page throws a JavaScript error, even when the screen looks right.
 *          Uncaught errors are real bugs that a purely visual check would miss.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    for (const host of ["localhost", "127.0.0.1"]) {
      await context.route(`http://${host}:8000/**`, (route) => route.abort("blockedbyclient"));
    }
    await use(context);
  },

  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use(page);
    expect(errors, "JavaScript errors on the page").toEqual([]);
  },
});
