# Lesson 6: Hooks and fixtures (set-up and clean-up)

Good tests leave nothing behind and do not depend on each other. Playwright gives two tools for that.

## Hooks

```ts
test.beforeAll(async ({ request }) => { /* once, before all tests in this file or describe */ });
test.beforeEach(async ({ page }) => { /* before every test */ });
test.afterEach(async ({ request }) => { /* after every test, even failed ones */ });
test.afterAll(async () => { /* once, at the end */ });
test.describe("group name", () => { /* hooks inside apply only to this group */ });
```

Hooks are simple, but sharing data through a `let` variable gets messy as files grow.

## Fixtures

A fixture is set-up code that a test **asks for by name**, like `page` and `request`. You write your own with
`test.extend`:

```ts
const test = base.extend<{ practiceAccount: Account }>({
  practiceAccount: async ({ request }, use) => {
    const account = await createPracticeAccount(request); // set-up
    await use(account);                                   // the test runs here
    await deletePracticeAccount(request, account.id);     // clean-up, always runs
  },
});

test("uses it", async ({ practiceAccount }) => { /* ... */ });
```

Why fixtures win:

- A test gets only what it asks for, and nothing runs if no test asks.
- Set-up and clean-up live together, so you cannot forget the clean-up.
- Fixtures can use other fixtures (`winningTrade` uses `practiceAccount`).
- `{ auto: true }` makes a fixture run for every test without asking. That is exactly how `support/test.ts` blocks
  port 8000 for every lesson. Open it now and read it.

## Exercise

Part 1 with hooks, Part 2 with two fixtures. See `exercise.spec.ts`.
