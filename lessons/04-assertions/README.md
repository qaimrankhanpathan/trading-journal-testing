# Lesson 4: Assertions (checking results)

## Two kinds of expect

**Web-first (auto-retrying)**: `await expect(locator or page).toSomething()`. Keeps checking for up to 5 seconds
until true. Use these for anything on the page.

| Check | Example |
|---|---|
| `toBeVisible()` / `toBeHidden()` | `await expect(page.getByText("TEST COPY")).toBeVisible()` |
| `toHaveText(t)` / `toContainText(t)` | exact text / part of the text (string or regular expression) |
| `toHaveValue(v)` | what is typed in a box |
| `toBeEnabled()` / `toBeDisabled()` | `await expect(page.getByTestId("back-button")).toBeDisabled()` |
| `toHaveCount(n)` | how many elements match |
| `toHaveURL(u)` / `toHaveTitle(t)` | on `page` |
| `.not` | `await expect(row).not.toBeVisible()` |

**Plain (instant)**: `expect(value).toBe(...)`, `toEqual`, `toBeGreaterThan`, `toBeCloseTo`, `toContain`,
`toMatchObject`... For numbers and data you already have. No `await` needed, no retrying.

A common pattern: wait with a web-first check, *then* read the value and check it with plain checks:

```ts
const risk = page.locator("div:has(> span:text-is('Risk')) > b");
await expect(risk).toHaveText(/^\$[\d,.]+$/);                       // wait until a dollar figure shows
const dollars = Number((await risk.innerText()).replace(/[$,]/g, ""));
expect(dollars).toBeLessThanOrEqual(100);                            // 1% of $10,000
```

## Soft checks

`expect.soft(...)` records a failure but lets the test carry on, so you see *every* problem in one run.

## expect.poll

For things that are not on the page (an API answer, a file), `expect.poll(async () => value).toBe(x)` keeps calling
your function until the value matches.

## Two surprises from the journal (good to know)

- Text that looks UPPERCASE on screen may be lowercase in the page, made capital by CSS. Checks use the real text.
- Losses use a real minus sign `−` (U+2212), not the keyboard `-`. Match with `/[−-]\$100\.00/`.

## Exercise

Back button states, the Accounts table, a risk limit check, soft checks and `expect.poll`. See `exercise.spec.ts`.
