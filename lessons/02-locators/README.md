# Lesson 2: Locators (finding things on the page)

A **locator** is a description of how to find an element. It does not search straight away; it searches every time
you act on it or check it, so it always sees the page as it is *now*.

## Prefer what the user sees

Pick locators in this order. The higher ones survive design changes and also check the page is accessible.

| Locator | Finds | Journal example |
|---|---|---|
| `getByRole(role, { name })` | buttons, links, headings, rows, tabs... by their accessible name | `page.getByRole("button", { name: "+ Add account" })` |
| `getByLabel(text)` | form boxes by their label | `page.getByLabel("Stop loss")` |
| `getByPlaceholder(text)` | boxes by their grey hint text | `page.getByPlaceholder("e.g. FPS-2-S")` |
| `getByText(text)` | any element by its text | `page.getByText("TEST COPY")` |
| `getByTestId(id)` | elements with `data-testid="..."` set by developers for tests | `page.getByTestId("back-button")` |
| `page.locator(css)` | anything, by CSS; last resort | `page.locator(".trades-table tbody tr")` |

`name` matching is "contains, any case" unless you add `exact: true`. The side menu has "Trades" and also a
"Trades" table elsewhere, so `{ name: "Trades", exact: true }` is safer.

## Narrowing down

```ts
const tabs = page.getByRole("navigation", { name: "Sections" }); // the tab bar
tabs.getByRole("link", { name: "Position size" });              // only links INSIDE the tab bar

page.getByRole("row").filter({ hasText: "PW-Account" });          // only rows that contain this text
page.getByRole("button").filter({ hasText: /^(Buy|Sell)$/ });    // regular expression: exactly Buy or Sell
locator.first(), locator.last(), locator.nth(2)                   // pick one of several (use sparingly)
```

## Strict mode

If a locator matches **more than one** element and you click it, Playwright stops with a *strict mode violation*.
That is a feature: it means your locator is ambiguous. Make it more specific (exact, scope, filter).

## Let Playwright suggest one

Run `npm run codegen`. A browser opens on the test copy, plus an inspector. Click **Pick locator** and hover any
element: the inspector shows the best locator for it. Copy it into your test.

## Exercise

Finish `exercise.spec.ts`. Each test only needs one to three lines.
