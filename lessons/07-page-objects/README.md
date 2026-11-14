# Lesson 7: Page objects (the Page Object Model)

After a few lessons you have seen `page.getByLabel("Stop loss")` in many files. If the journal renames that box,
every one of those tests breaks. A **page object** is a class that holds one page's locators and actions, so each
change is fixed in one place and tests read like plain English:

```ts
// without a page object
await page.getByLabel("Account").selectOption(String(account.id));
await page.getByLabel("Symbol").selectOption("EURUSD");
await page.getByRole("button", { name: "Buy", exact: true }).click();
await page.getByLabel("Entry").fill("1.1");
await page.getByLabel("Stop loss").fill("1.099");

// with one
await calculatorPage.size({ accountId: account.id, symbol: "EURUSD", side: "Buy", entry: "1.1", stop: "1.099" });
```

## What is in ./pages

| File | Holds |
|---|---|
| `BasePage.ts` | what every page has: the h1 heading, the Back button, menu links, `open()` |
| `AccountsPage.ts` | the Add account button and a `row(name)` helper |
| `CalculatorPage.ts` | the form boxes, `size(...)`, `figure("Risk")`, `riskDollars()` |
| `TradesPage.ts` | the table rows, `showAllTime()`, `rowFor(name)` |
| `fixtures.ts` | hands each page object to tests as a fixture (`accountsPage`, `calculatorPage`...) |

Rules of thumb:

- Page objects **find and do**. Tests **check**. (Keep most `expect`s in the tests.)
- One class per page; shared parts go in `BasePage` (inheritance with `extends`).
- Give methods names a trader would use (`size`, `showAllTime`), not names of HTML elements.

The journal's own suite does exactly this at full size: see `frontend/e2e/pages` in trading-journal-propfirm.

## Exercise

Build `MyCalculatorPage` inside `exercise.spec.ts` and use it in two tests. Compare with `pages/CalculatorPage.ts`
afterwards. Extra challenge: write a `DashboardPage` in `./pages` and add it to `fixtures.ts`.
