import { expect, type APIRequestContext } from "@playwright/test";

/**
 * Practice data helpers. Everything they create:
 *  - lives only in the TEST COPY (start-test.bat makes a fresh copy each time, so it disappears on the next start);
 *  - has a name starting with "PW-" so you can spot it;
 *  - uses trades dated October 2026, before your journal start date, so they are "Pre-journal":
 *    they are never judged by your rules and never set off the rule-breach alarm.
 * Lesson 5 explains the API calls used here.
 */

let counter = 0;

/** A name nobody else has, e.g. "PW-Account-lx3k9a-1". */
export function uniqueName(prefix: string) {
  return `PW-${prefix}-${Date.now().toString(36)}-${++counter}`;
}

export type Account = { id: number; name: string; starting_balance: number; [key: string]: unknown };
export type Trade = { id: number; account_id: number; symbol: string; net_pnl: number | null; [key: string]: unknown };

/** A $10,000 FundingPips evaluation account. */
export async function createPracticeAccount(request: APIRequestContext, extra: Record<string, unknown> = {}): Promise<Account> {
  const res = await request.post("/api/accounts", {
    data: {
      name: uniqueName("Account"),
      firm: "FundingPips",
      phase: "challenge",
      platform: "MT5",
      starting_balance: 10000,
      profit_target_pct: 8,
      daily_loss_limit_pct: 5,
      max_drawdown_pct: 10,
      ...extra,
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  return res.json();
}

/** A closed 1-lot EURUSD buy with a 10 pip stop. win = +20 pips, loss = -10 pips. */
export async function createPracticeTrade(request: APIRequestContext, accountId: number, win = true): Promise<Trade> {
  const res = await request.post("/api/trades", {
    data: {
      account_id: accountId,
      symbol: "EURUSD",
      side: "buy",
      open_time: "2026-10-14T09:00:00",
      close_time: "2026-10-14T09:45:00",
      entry_price: 1.1,
      exit_price: win ? 1.102 : 1.099,
      stop_loss: 1.099,
      lots: 1,
      fees: 0,
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  return res.json();
}

/** Deletes an account and its trades. Safe to call twice. */
export async function deletePracticeAccount(request: APIRequestContext, accountId: number) {
  const res = await request.delete(`/api/accounts/${accountId}`);
  expect([204, 404]).toContain(res.status());
}
