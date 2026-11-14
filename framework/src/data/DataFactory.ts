import type { JournalApi } from "../api";
import type { Account, Trade } from "../api/types";
import { anAccount, aTrade, type AccountBuilder, type TradeBuilder } from "./builders";

/**
 * DATA FACTORY: creates test data through the API (fast and reliable) and REMEMBERS what it made, so the fixture
 * can delete all of it after the test, even when the test fails halfway.
 *
 * Why the API and not the screens? A test about the Trades page should not fail because the Accounts form broke.
 * Set up through the API, test through the screen you are testing: this is how professional suites stay stable.
 */
export class DataFactory {
  // Tracked by NAME: the database can hand a deleted account's id to a brand-new account of another test,
  // so deleting by a remembered id alone could delete someone else's data. Names are unique per test.
  private readonly accountNames = new Set<string>();

  constructor(private readonly api: JournalApi) {}

  /** An account with sensible defaults. Change what matters: data.account((a) => a.withBalance(50_000)). */
  async account(customise: (b: AccountBuilder) => AccountBuilder = (b) => b): Promise<Account> {
    const account = await this.api.accounts.create(customise(anAccount()).build());
    this.accountNames.add(account.name);
    return account;
  }

  /** A trade on an account. Deleting the account at clean-up deletes its trades too. */
  async trade(accountId: number, customise: (b: TradeBuilder) => TradeBuilder = (b) => b): Promise<Trade> {
    return this.api.trades.create(customise(aTrade(accountId)).build());
  }

  /** For data a test creates through the SCREEN: register its name so clean-up deletes it too. */
  trackAccountName(name: string): void {
    this.accountNames.add(name);
  }

  /** Called by the fixture after every test. Never throws: clean-up must not hide the real test result. */
  async cleanUp(): Promise<void> {
    if (this.accountNames.size === 0) return;
    const existing = await this.api.accounts.list().catch(() => []);
    for (const account of existing.filter((a) => this.accountNames.has(a.name))) {
      await this.api.accounts
        .delete(account.id)
        .catch((e: unknown) => console.warn(`clean-up: could not delete ${account.name}: ${String(e)}`));
    }
  }
}
