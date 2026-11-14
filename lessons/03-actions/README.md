# Lesson 3: Actions (clicking, typing, choosing)

| Action | Use for | Example |
|---|---|---|
| `click()` | buttons, links, tabs | `page.getByRole("button", { name: "Buy", exact: true }).click()` |
| `fill(text)` | text and number boxes (clears first) | `page.getByLabel("Entry").fill("1.1")` |
| `selectOption(x)` | drop-downs (`<select>`) | `page.getByLabel("Symbol").selectOption("EURUSD")` |
| `check()` / `uncheck()` | tick boxes | `page.getByLabel("Reviewed").check()` |
| `press(key)` | one key in one element | `page.getByLabel("Entry").press("Tab")` |
| `page.keyboard.type(text)` | typing like a person, key by key | `page.keyboard.type("1.25")` |
| `hover()` | showing tooltips | `page.getByRole("button", { name: "i" }).first().hover()` |

`selectOption` accepts the option's **value** (`"12"`, our account id) or its **visible text** (`"EURUSD"`).

## Auto-waiting

Before every action Playwright waits until the element is there, visible, enabled and not moving. That is why there
are no `sleep`s in good Playwright tests. If you ever feel the need for `page.waitForTimeout(...)`, there is almost
always a better check to wait for (lesson 4).

## Test data for this lesson

The Position size page needs an account. `support/data.ts` makes a practice account through the journal's API in
`beforeAll` and deletes it in `afterAll`:

```ts
let account: Account;
test.beforeAll(async ({ request }) => { account = await createPracticeAccount(request); });
test.afterAll(async ({ request }) => { await deletePracticeAccount(request, account.id); });
```

You will write API calls yourself in lesson 5 and better set-up code (fixtures) in lesson 6.

## Exercise

Size a EURUSD buy with a 10 pip stop on the Position size page, practise keyboard keys, and click a menu link.
See the TODOs in `exercise.spec.ts`.

Extra challenge: size a **sell** on XAUUSD and check the Result card still shows "Lots".
