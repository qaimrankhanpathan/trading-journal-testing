/**
 * The shapes the journal API sends and receives. Only the fields the tests use are listed; `[key: string]: unknown`
 * keeps the rest without having to type all of them. If the API renames a field, TypeScript points at every test
 * that uses it (run `npm run typecheck`).
 */

export type Phase = "challenge" | "verification" | "funded";
export type Side = "buy" | "sell";

export interface AccountInput {
  name: string;
  firm: string;
  phase?: Phase;
  platform?: string;
  starting_balance: number;
  profit_target_pct?: number;
  daily_loss_limit_pct?: number;
  max_drawdown_pct?: number;
  [key: string]: unknown;
}

export interface Account extends AccountInput {
  id: number;
}

export interface TradeInput {
  account_id: number;
  symbol: string;
  side: Side;
  open_time: string;
  close_time?: string | null;
  entry_price: number;
  exit_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  lots: number;
  fees?: number | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface Trade extends TradeInput {
  id: number;
  net_pnl: number | null;
}

export interface Health {
  ok: boolean;
  test_copy: boolean;
  schema_version: number;
  [key: string]: unknown;
}
