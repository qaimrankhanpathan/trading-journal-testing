# Trading Journal Testing: learn Playwright step by step

Ten short lessons that teach [Playwright](https://playwright.dev) test automation, using your own Trading Journal
as the practice app. Each lesson has:

- **README.md**: a short explanation with examples
- **exercise.spec.ts**: tests for you to finish (look for `TODO`)
- **solution.spec.ts**: a worked answer that passes

## Safety first: always the test copy, never your real journal

| | Address | Started by | Used by these lessons? |
|---|---|---|---|
| Real journal | http://localhost:8000 | start.bat / TradingJournal.exe | **Never** |
| Test copy | http://localhost:8001 | start-test.bat | **Always** |

Three guards make sure of this:

1. `support/global-setup.ts` runs before any test. It asks the journal at port 8001 for `/api/health`, and stops
   everything unless the answer says `"test_copy": true`. Only `start-test.bat` starts a journal that says that.
2. `support/test.ts` blocks the browser from opening anything on port 8000, even if a test types that address.
3. Everything the lessons create is named `PW-...` and dated October 2026 (before your journal start date), so it
   is "Pre-journal": never judged by your rules and never sets off the rule-breach alarm. `start-test.bat` makes a
   fresh copy each time it starts, so practice data disappears on the next start anyway.

## One-time setup (Windows)

You already have Node 24 and Git. Open **Command Prompt** (or the terminal in VS Code) and run:

```bat
cd %USERPROFILE%\Documents\GitHub
git clone https://github.com/qaimrankhanpathan/trading-journal-testing.git
cd trading-journal-testing
npm install
```

The lessons use **Microsoft Edge**, which Windows already has, so there is no browser to download.
(If you would rather use Playwright's own Chromium: `npx playwright install chromium`, then `set PW_CHANNEL=chromium`.)

A good editor helps a lot: [VS Code](https://code.visualstudio.com) with the
**Playwright Test for VS Code** extension lets you run and debug any test with one click.

## Every time you practise

1. Double-click **start-test.bat** in your `trading-journal-propfirm` folder. Wait until it says
   *TEST COPY of the Trading Journal is running at http://localhost:8001*. Keep that window open.
2. In the `trading-journal-testing` folder, run one lesson's exercises:

   ```bat
   npx playwright test lessons/01 --project=exercises
   ```

3. When you are done, close the start-test.bat window.

## Useful commands

| Command | What it does |
|---|---|
| `npm test` | Run all your exercises |
| `npm run solutions` | Run all the worked solutions (a good check that your setup works) |
| `npx playwright test lessons/03 --project=exercises` | Run one lesson |
| `npm run ui` | UI mode: watch tests run, step through them, pick locators (lesson 8) |
| `npm run report` | Open the HTML report of the last run |
| `npm run codegen` | Click around the test copy and let Playwright write the code |
| `npm run typecheck` | Check your TypeScript for mistakes without running anything |

## The lessons

| # | Lesson | You will learn |
|---|---|---|
| 01 | [Your first test](lessons/01-first-test/README.md) | Running tests, `page.goto`, your first `expect` |
| 02 | [Locators](lessons/02-locators/README.md) | Finding things: `getByRole`, `getByLabel`, `getByTestId`, scoping, `filter` |
| 03 | [Actions](lessons/03-actions/README.md) | `click`, `fill`, `selectOption`, `press`, keyboard |
| 04 | [Assertions](lessons/04-assertions/README.md) | Auto-waiting checks, `toHaveURL`, `toHaveCount`, soft checks, `expect.poll` |
| 05 | [API testing](lessons/05-api-testing/README.md) | The `request` fixture, status codes, create/read/update/delete, negative tests |
| 06 | [Hooks and fixtures](lessons/06-hooks-and-fixtures/README.md) | `beforeEach`/`afterEach`, `test.extend`, set-up and clean-up |
| 07 | [Page objects](lessons/07-page-objects/README.md) | The Page Object Model: one place for each page's locators |
| 08 | [Debugging](lessons/08-debugging/README.md) | UI mode, `--debug`, trace viewer, `test.step`, screenshots, console errors |
| 09 | [Organising tests](lessons/09-organising-tests/README.md) | Tags, `--grep`, projects (phone screen), skip, parallel, retries |
| 10 | [CI later](lessons/10-ci-later/README.md) | Running tests on GitHub Actions (ready, switched off for now) |

Suggested pace: one lesson a day. Do the exercise **before** opening the solution.

## Next step: the professional framework

After the lessons, [framework/README.md](framework/README.md) shows the same ideas put together the way test automation
engineers build a real suite: page objects and components, an API layer, test data builders with automatic clean-up,
custom fixtures and matchers, config from `.env`, `@smoke`/`@regression` tags, HTML + JUnit reports, traces on failure,
ESLint and Prettier. Start with `npm run fw:smoke` (test copy running, as always).

## Project layout

```
playwright.config.ts     settings: test copy address, browser, projects (exercises / solutions / phone)
support/global-setup.ts  safety check: refuses to run unless port 8001 is the test copy
support/test.ts          test + expect to import in every lesson (blocks port 8000)
support/data.ts          practice data helpers (accounts and trades through the API)
lessons/NN-name/         README.md, exercise.spec.ts, solution.spec.ts
ci/playwright.yml        a GitHub Actions workflow for lesson 10 (not switched on)
framework/               the professional framework (its own README, config and tests)
```

## Where the examples come from

The journal itself has a large Playwright suite (`frontend/e2e` in trading-journal-propfirm, about 200 page tests
with a Page Object Model). Once you finish lesson 7, reading `frontend/e2e/pages` and `frontend/e2e/suite` there is
a great next step: it uses exactly the ideas from these lessons, at full size.
