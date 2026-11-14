# Lesson 5: API testing

The journal's screens talk to a backend through an API (`/api/...`). You can test that API directly: it is much
faster than the browser, and it lets you check rules the screen never shows.

The `request` fixture is a little HTTP client that already knows `baseURL`:

```ts
test("health", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.test_copy).toBe(true);
});
```

| Method | Meaning | Journal example | Success code |
|---|---|---|---|
| `request.get` | read | `/api/accounts`, `/api/accounts/12` | 200 |
| `request.post` | create | `/api/accounts` with `{ data: {...} }` | 201 |
| `request.put` | replace / update | `/api/accounts/12` with the whole account | 200 |
| `request.delete` | remove | `/api/accounts/12` | 204 |

## Negative tests

A good tester checks what must **fail**, too. The journal answers with:

- **404** Not found (an id that does not exist)
- **409** Conflict (e.g. two accounts with the same name)
- **422** Unprocessable (missing or wrong fields); the body's `detail` lists each problem with its `loc` (field)

## Where to see the whole API

With the test copy running, open **http://localhost:8001/docs**. It lists every endpoint and lets you try them.

## Mixing API and UI

The most useful pattern in real projects: create data through the API (fast, reliable), then check the screen
shows it correctly. You did this already in lesson 4 with `createPracticeAccount`. Open `support/data.ts` now:
you will understand all of it.

## Exercise

Health check, a full create/read/update/delete, two negative tests and a P&L check. See `exercise.spec.ts`.
Extra challenge: check a **losing** trade gives `net_pnl` close to `-100`.
