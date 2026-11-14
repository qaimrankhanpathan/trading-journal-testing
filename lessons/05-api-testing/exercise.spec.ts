import { test, expect } from "../../support/test";
import { uniqueName } from "../../support/data";

// Lesson 5 exercise: API tests use the `request` fixture instead of `page`. Remove ".fixme" to run a test.

test.fixme("the health check says this is the test copy", async ({ request }) => {
  // TODO 1: GET /api/health and check res.ok() is truthy.
  // TODO 2: read the JSON body; check body.ok is true and body.test_copy is true.
});

test.fixme("create, read, update and delete an account", async ({ request }) => {
  const name = uniqueName("Api");
  // TODO CREATE: POST /api/accounts with { name, firm: "The5ers", phase: "challenge", starting_balance: 20000,
  //              profit_target_pct: 8, daily_loss_limit_pct: 5, max_drawdown_pct: 10 }. Expect status 201.
  //              Use toMatchObject to check name, firm and starting_balance in the reply.
  // TODO READ:   GET /api/accounts/<id>. Expect 200 and the same name.
  // TODO UPDATE: PUT /api/accounts/<id> with { ...account, profit_target_pct: 10 }. Expect 200 and 10 in the reply.
  // TODO DELETE: DELETE /api/accounts/<id> gives 204, and a GET afterwards gives 404.
});

test.fixme("negative: two accounts cannot share a name (409)", async ({ request }) => {
  const data = { name: uniqueName("Twice"), firm: "FundingPips", starting_balance: 10000 };
  // TODO: POST it twice. First = 201, second = 409 with a "detail" message containing "already exists".
  //       Delete the first account at the end.
});

test.fixme("negative: missing required fields are refused (422)", async ({ request }) => {
  // TODO: POST /api/accounts with only { firm: "FundingPips" }. Expect 422.
  //       The body's "detail" is a list; each item has "loc" (a path such as ["body", "name"]).
  //       Check that the missing fields include "name" and "starting_balance".
});

test.fixme("a trade's profit is worked out by the journal", async ({ request }) => {
  // TODO 1: create an account (as above).
  // TODO 2: POST /api/trades: EURUSD buy, 1 lot, fees 0, open 2026-10-14T09:00:00, close 2026-10-14T09:45:00,
  //         entry 1.1, exit 1.102, stop 1.099. Expect 201.
  // TODO 3: net_pnl should be close to 200 (toBeCloseTo). Delete the account at the end.
});
