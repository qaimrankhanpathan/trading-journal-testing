# The framework: a professional Playwright test suite for the Trading Journal

The `lessons/` folder teaches Playwright one idea at a time. This `framework/` folder puts all of those ideas together
the way test automation engineers build a suite at work: layers, page objects, fixtures, test data builders,
config from the environment, tags, reports, lint and formatting.

It tests the journal **test copy on port 8001 only**, with the same safety guards as the lessons (see [Safety](#safety)).

## Quick start (Windows)

1. Double-click **start-test.bat** in your `trading-journal-propfirm` folder and wait for
   _TEST COPY of the Trading Journal is running at http://localhost:8001_.
2. In the `trading-journal-testing` folder (after `npm install` once, to get the new tools):

   ```bat
   npm run fw:smoke
   ```

3. Open the report: `npm run fw:report`

## Commands

| Command                               | What it runs                                                   | When a professional runs it                                        |
| ------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| `npm run fw:smoke`                    | only `@smoke` tests (about 20, under a minute)                 | first, after every change: "is it basically working?"              |
| `npm run fw:regression`               | only `@regression` tests                                       | before merging a change: "did I break anything that used to work?" |
| `npm run fw:test`                     | everything, on desktop and phone screens                       | before a release                                                   |
| `npm run fw:api`                      | the API tests only (no browser, a few seconds)                 | while working on the backend                                       |
| `npm run fw:ui`                       | the browser tests on a desktop screen                          | while working on the screens                                       |
| `npm run fw:headed`                   | the browser tests in a visible window, one at a time           | to watch what a test does                                          |
| `npm run fw:debug`                    | step through a test line by line with the Playwright Inspector | when a test fails and you do not see why                           |
| `npm run fw:report`                   | opens the HTML report of the last run                          | after every run                                                    |
| `npm run check`                       | typecheck + lint + format check (runs no tests)                | before every commit                                                |
| `npm run lint:fix` / `npm run format` | fix lint problems and formatting automatically                 | before every commit                                                |

Run one file or one test by name:

```bat
npx playwright test -c framework tests/ui/trades.spec.ts
npx playwright test -c framework -g "losing trade"
npx playwright test -c framework --grep "@api" --grep-invert "@smoke"
```

## How it is built

```
framework/
├── playwright.config.ts        settings: projects, reporters, evidence on failure
├── config/env.ts               ALL settings that change between machines, read and checked once
├── .env.example                copy to .env to change settings without touching code
├── src/
│   ├── safety/global-setup.ts  pre-flight check: refuses to run unless port 8001 is the test copy
│   ├── api/                    API layer: one class per API area (AccountsApi, TradesApi) on a shared ApiClient
│   ├── pages/                  Page Object Model: one class per screen, plus components (SideMenu, TradeForm)
│   ├── data/                   test data: builders (anAccount(), aTrade()) and the DataFactory with auto clean-up
│   ├── fixtures/               the `test` every spec imports: pages, api, data, safety, custom expect, tags
│   └── utils/                  small helpers: money parsing, unique names, the @step decorator
├── test-data/                  data files for data-driven tests (trade-pnl.json)
├── tests/
│   ├── api/                    API tests: fast, no browser
│   ├── ui/                     one screen at a time (data set up through the API)
│   └── e2e/                    a few whole user journeys across screens
└── reports/                    created by a run (not committed): html/, junit.xml, test-results/
```

A test reads like a test case, because every detail lives in a lower layer:

```ts
test("a losing trade shows its loss", { tag: TAG.SMOKE }, async ({ data, tradesPage }) => {
  const account = await data.account(); // fixtures + data factory (cleaned up afterwards)
  await data.trade(account.id, (t) => t.losing(10)); // builder: only the detail that matters

  await tradesPage.open(); // page object
  await tradesPage.showAllTime();

  await expect(tradesPage.rowFor(account.name)).toShowMoney(-100); // custom matcher
});
```

### Each piece, and why professionals use it

**1. Layers (tests → fixtures → pages / api / data → Playwright).**
Tests say _what_ is checked; the layers below know _how_. When the journal's screen changes, you fix one page object,
not 30 tests. Rule of thumb: a spec file should contain no CSS selectors and no URLs except page paths.

**2. Environment config (`config/env.ts`, `.env`).**
Addresses, browser, workers and retries are not written into tests. They are read once, checked, and typed. The same
suite then runs on your PC, a colleague's PC or a CI server just by changing environment values, and a typo like
`WORKERS=two` stops the run with a clear message instead of doing something odd.

**3. Page Object Model (`src/pages`).**
One class per screen holds its locators and user actions (`tradesPage.logTrade(...)`). `BasePage` has what every
screen shares; _components_ (`SideMenu`, `TradeForm`) are reused by composition. Page objects use user-facing locators
(`getByRole`, `getByLabel`) and do not decide whether a test passed: that is the test's job.

**4. API layer (`src/api`).**
The same idea for the backend: `api.accounts.create(...)`. The shared `ApiClient` checks status codes and puts the
server's answer in the failure message, so a failing call says _why_ (`answered 422: {"detail": ...}`). `...Raw`
methods return the raw response for negative tests that expect an error.

**5. Test data builders and the data factory (`src/data`).**
`anAccount().withBalance(25_000).build()` gives a valid account where only the balance is special. Tests set up data
**through the API** (fast, and a broken form cannot break unrelated tests) and check **through the screen** they are about.
The `data` fixture remembers everything it created and deletes it after the test, even when the test fails.

**6. Custom fixtures (`src/fixtures`).**
`test.extend()` gives every test what it needs by name: `async ({ tradesPage, api, data }) => ...`. Small fixture
files (safety, data, pages) are joined with `mergeTests()`. Code after `await use(...)` is teardown that always runs.
The safety fixture also makes every browser test fail on an uncaught JavaScript error on the page.

**7. Custom matchers (`expect.extend` in `src/fixtures/index.ts`).**
`toShowMoney(-100)` accepts "−$100.00" and "-$100.00" and explains itself when it fails. Domain language in
assertions makes failures easy to read for anyone.

**8. Tags (`src/fixtures/tags.ts`).**
`@smoke`, `@regression`, `@api`, `@ui`, `@e2e`, `@a11y`. They come from one list so a typo cannot silently drop a test
from a run. Tags let you pick a run by purpose (`--grep @smoke`) instead of by folder.

**9. Data-driven tests (`test-data/trade-pnl.json`).**
The P&L tests are one loop over a JSON file. A new case is a new line of data, and each case is its own test in the
report.

**10. Projects (`playwright.config.ts`).**
`api` (no browser), `desktop` and `phone` (Pixel 7 screen, smoke tests only). The same tests, different set-ups.

**11. Parallel runs that do not interfere.**
Every test makes its own uniquely named data (`PW-FW-...-w1-3`), so tests can run at the same time (`WORKERS`). Lesson
learned while building this: the journal's database can give a deleted account's id to the next new account, so the
clean-up and the delete tests identify data by its **unique name**, never by a remembered id. That bug made two tests
fail about once in a hundred runs; the suite has since passed 576 runs in a row with 4 workers.

**12. Evidence on failure.**
When a test fails you get a screenshot, a video and a **trace** (every action, network call, console line and a
snapshot of the page at each step). Open the HTML report, click the failed test, then click the trace.
The `@step` decorator on page object methods makes the report read like the test case:
`TradesPage.open > Show trades of all time > ...`.

**13. Reporters.**
`list` for you in the terminal, `html` for you after the run, `junit` (`reports/junit.xml`) for CI servers and test
management tools.

**14. Lint and format (`eslint.config.mjs`, `.prettierrc.json`).**
ESLint catches the most common Playwright bug (a missing `await`), `page.waitForTimeout`, a forgotten `test.only`,
and `expect` hidden inside `if`. Prettier formats every file the same way, so reviews are about logic, not spaces.
`npm run check` runs typecheck, lint and format check together. These cover `framework/` only; your lesson files
are left alone.

**15. Accessibility (`tests/ui/accessibility.spec.ts`).**
axe-core checks pages against WCAG rules. The test fails on _critical_ problems and attaches the full findings
to the report: a common way to stop things getting worse while the rest is fixed over time.

## Safety

| Guard              | Where                            | What it does                                                                               |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------------------------ |
| Address check      | `config/env.ts`                  | refuses to load if the address is port 8000 or not on this PC                              |
| Pre-flight check   | `src/safety/global-setup.ts`     | stops the run unless `/api/health` says `"test_copy": true`                                |
| Browser block      | `src/fixtures/safety.fixture.ts` | the browser cannot open anything on port 8000                                              |
| Practice data only | `src/data/builders.ts`           | everything is named `PW-FW-...`, trades are dated October 2026 (pre-journal, never judged) |
| Clean-up           | `src/data/DataFactory.ts`        | deletes what each test created; start-test.bat also starts from a fresh copy each time     |

The framework never changes journal settings, never touches MT5 and never uses a trading account.

## Adding a test of your own

1. Pick the layer: API (`tests/api`), one screen (`tests/ui`) or a journey (`tests/e2e`).
2. `import { test, expect, TAG } from "@fixtures";` and ask for what you need: `async ({ data, tradesPage }) => ...`.
3. Set up data with `data.account(...)` / `data.trade(...)`. Never reuse data from another test.
4. If you need a new locator or action, add it to the page object, not the test.
5. Tag it (`{ tag: TAG.REGRESSION }`), run it, then `npm run check`.

## CI later

No GitHub Actions workflow is included on purpose (your Actions minutes are used up). Everything runs locally. When you
want CI, lesson 10 in `lessons/10-ci-later` explains it; for this framework the command would be
`npx playwright test -c framework` with `CI=true`, which turns on retries and the `test.only` guard automatically.
