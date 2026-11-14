import type { AccountInput, Phase, TradeInput } from "../api/types";
import { uniqueName } from "../utils/unique";

/**
 * TEST DATA BUILDERS ("builder pattern").
 *
 * A test should only mention the data that matters to it. Builders fill in sensible defaults for everything else:
 *
 *   anAccount().withBalance(25_000).build()              // every other field is a valid default
 *   aTrade(accountId).sell().losing().build()           // a closed EURUSD sell that lost 10 pips
 *
 * If the API adds a required field tomorrow, you add a default here once, and no test changes.
 *
 * SAFETY: trades are dated October 2026, before the journal start date of the real journal the test copy is
 * made from. They are "Pre-journal": never judged by the trading rules, never set off the rule-breach alarm.
 */

export const PRE_JOURNAL_DAY = "2026-10-14"; // a Wednesday

export class AccountBuilder {
  private data: AccountInput = {
    name: uniqueName("Account"),
    firm: "FundingPips",
    phase: "challenge",
    platform: "MT5",
    starting_balance: 10_000,
    profit_target_pct: 8,
    daily_loss_limit_pct: 5,
    max_drawdown_pct: 10,
  };

  named(name: string): this {
    this.data.name = name;
    return this;
  }

  withFirm(firm: string): this {
    this.data.firm = firm;
    return this;
  }

  withBalance(dollars: number): this {
    this.data.starting_balance = dollars;
    return this;
  }

  inPhase(phase: Phase): this {
    this.data.phase = phase;
    return this;
  }

  withRules(rules: { target?: number; dailyLoss?: number; maxDrawdown?: number }): this {
    if (rules.target !== undefined) this.data.profit_target_pct = rules.target;
    if (rules.dailyLoss !== undefined) this.data.daily_loss_limit_pct = rules.dailyLoss;
    if (rules.maxDrawdown !== undefined) this.data.max_drawdown_pct = rules.maxDrawdown;
    return this;
  }

  build(): AccountInput {
    return { ...this.data };
  }
}

/** Defaults: a closed 1-lot EURUSD buy, entry 1.10000, stop 10 pips away, that won 20 pips (+$200). */
export class TradeBuilder {
  private data: TradeInput;
  private pips: number | null = 20; // the result in pips; null = still open

  constructor(accountId: number) {
    this.data = {
      account_id: accountId,
      symbol: "EURUSD",
      side: "buy",
      open_time: `${PRE_JOURNAL_DAY}T09:00:00`,
      close_time: `${PRE_JOURNAL_DAY}T09:45:00`,
      entry_price: 1.1,
      lots: 1,
      fees: 0,
    };
  }

  buy(): this {
    this.data.side = "buy";
    return this;
  }

  sell(): this {
    this.data.side = "sell";
    return this;
  }

  /** The trade made `pips` pips. */
  winning(pips = 20): this {
    this.pips = pips;
    return this;
  }

  /** The trade lost `pips` pips (the default 10 pips is exactly the stop loss: a 1R loss). */
  losing(pips = 10): this {
    this.pips = -pips;
    return this;
  }

  /** A trade that is still running: no exit yet. */
  open(): this {
    this.pips = null;
    return this;
  }

  lots(lots: number): this {
    this.data.lots = lots;
    return this;
  }

  withNotes(notes: string): this {
    this.data.notes = notes;
    return this;
  }

  /** Any other field, for the rare test that needs it. */
  with(fields: Partial<TradeInput>): this {
    this.data = { ...this.data, ...fields };
    return this;
  }

  build(): TradeInput {
    const dir = this.data.side === "buy" ? 1 : -1;
    const pip = 0.0001;
    const priced: Partial<TradeInput> = {
      stop_loss: round(this.data.entry_price - dir * 10 * pip),
      exit_price: this.pips === null ? null : round(this.data.entry_price + dir * this.pips * pip),
      close_time: this.pips === null ? null : `${PRE_JOURNAL_DAY}T09:45:00`,
    };
    return { ...priced, ...this.data, ...(this.pips === null ? { exit_price: null, close_time: null } : {}) };
  }
}

function round(price: number): number {
  return Math.round(price * 100_000) / 100_000;
}

export const anAccount = () => new AccountBuilder();
export const aTrade = (accountId: number) => new TradeBuilder(accountId);
