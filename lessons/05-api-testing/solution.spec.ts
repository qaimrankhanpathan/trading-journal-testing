import { test, expect } from "../../support/test";
import { uniqueName } from "../../support/data";

// Lesson 5 solution: testing the journal's API directly, without a browser page.

test("the health check says this is the test copy", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.test_copy).toBe(true);
});

test("create, read, update and delete an account", async ({ request }) => {
  const name = uniqueName("Api");

  // CREATE
  const created = await request.post("/api/accounts", {
    data: { name, firm: "The5ers", phase: "challenge", starting_balance: 20000, profit_target_pct: 8, daily_loss_limit_pct: 5, max_drawdown_pct: 10 },
  });
  expect(created.status()).toBe(201);
  const account = await created.json();
  expect(account).toMatchObject({ name, firm: "The5ers", starting_balance: 20000 });

  // READ
  const read = await request.get(`/api/accounts/${account.id}`);
  expect(read.status()).toBe(200);
  expect((await read.json()).name).toBe(name);

  // UPDATE (PUT sends the whole account)
  const updated = await request.put(`/api/accounts/${account.id}`, { data: { ...account, profit_target_pct: 10 } });
  expect(updated.status()).toBe(200);
  expect((await updated.json()).profit_target_pct).toBe(10);

  // DELETE
  expect((await request.delete(`/api/accounts/${account.id}`)).status()).toBe(204);
  expect((await request.get(`/api/accounts/${account.id}`)).status()).toBe(404);
});

test("negative: two accounts cannot share a name (409)", async ({ request }) => {
  const data = { name: uniqueName("Twice"), firm: "FundingPips", starting_balance: 10000 };
  const first = await request.post("/api/accounts", { data });
  expect(first.status()).toBe(201);

  const second = await request.post("/api/accounts", { data });
  expect(second.status()).toBe(409);
  expect((await second.json()).detail).toContain("already exists");

  await request.delete(`/api/accounts/${(await first.json()).id}`);
});

test("negative: missing required fields are refused (422)", async ({ request }) => {
  const res = await request.post("/api/accounts", { data: { firm: "FundingPips" } });
  expect(res.status()).toBe(422);
  const missing = (await res.json()).detail.map((d: { loc: string[] }) => d.loc.at(-1));
  expect(missing).toEqual(expect.arrayContaining(["name", "starting_balance"]));
});

test("a trade's profit is worked out by the journal", async ({ request }) => {
  const acc = await (await request.post("/api/accounts", { data: { name: uniqueName("Pnl"), firm: "FundingPips", starting_balance: 10000 } })).json();
  const res = await request.post("/api/trades", {
    data: {
      account_id: acc.id, symbol: "EURUSD", side: "buy", lots: 1, fees: 0,
      open_time: "2026-10-14T09:00:00", close_time: "2026-10-14T09:45:00",
      entry_price: 1.1, exit_price: 1.102, stop_loss: 1.099,
    },
  });
  expect(res.status()).toBe(201);
  const trade = await res.json();
  expect(trade.net_pnl).toBeCloseTo(200, 2); // 20 pips x $10 per pip on 1 lot
  await request.delete(`/api/accounts/${acc.id}`);
});
