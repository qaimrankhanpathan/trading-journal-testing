# Lesson 9: Organising tests

As the number of tests grows, you want to run the right ones at the right time.

## Groups and tags

```ts
test.describe("smoke: every main page opens", { tag: "@smoke" }, () => { ... });
test("a slow check", { tag: "@slow" }, async ({ page }) => { ... });
```

```bat
npx playwright test --project=solutions --grep @smoke          :: only smoke tests
npx playwright test --project=solutions --grep-invert @slow    :: everything except slow ones
npx playwright test -g "Back button"                           :: by part of the test name
```

The journal's own suite uses tags such as `@smoke`, `@functional`, `@negative`, `@ui`.

## Data-driven tests

A `for` loop over a list makes one test per item, each reported separately (see the PAGES list).

## Projects

`playwright.config.ts` has three **projects**: `exercises`, `solutions` and `phone`. A project is a set of tests plus
settings. `phone` reruns the `@phone` solutions on a Pixel 7-sized screen (`devices["Pixel 7"]`) to catch layouts
that scroll sideways. You run a project with `--project=phone`. Leave `--project` out to run all of them.

## Skip, fixme, slow, fail

| Call | Meaning |
|---|---|
| `test.skip(condition, reason)` | do not run here (e.g. not on a desktop screen) |
| `test.fixme(...)` | known broken / not written yet (your exercises!) |
| `test.slow()` | allow 3x the normal time |
| `test.fail()` | this test is *expected* to fail (documents a known bug) |

## Speed: workers, parallel and retries

- `workers: 1` in the config runs one test at a time: easy to follow while learning. `npx playwright test --workers=4`
  runs four at once. Only tests that do not share data are safe to run in parallel; that is why every lesson uses
  unique `PW-...` names and its own practice account.
- `test.describe.configure({ mode: "parallel" })` lets tests *inside one file* run at the same time.
- `retries: 2` reruns a failed test. Use it only in CI, and treat a test that needs retries ("flaky") as a bug.

## Exercise

Tag and loop the smoke tests, write a phone check, and add your own `phone-exercises` project to the config.
