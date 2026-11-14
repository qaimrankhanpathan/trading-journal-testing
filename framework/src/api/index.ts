import type { APIRequestContext } from "@playwright/test";
import { AccountsApi } from "./AccountsApi";
import { ApiClient } from "./ApiClient";
import { TradesApi } from "./TradesApi";
import type { Health } from "./types";

class HealthApi extends ApiClient {
  get(): Promise<Health> {
    return this.expectJson("GET", "/api/health", 200);
  }
}

/** One object with every API service: `api.accounts.create(...)`, `api.trades.forAccount(...)`, `api.health.get()`. */
export class JournalApi {
  readonly accounts: AccountsApi;
  readonly trades: TradesApi;
  readonly health: HealthApi;

  constructor(request: APIRequestContext) {
    this.accounts = new AccountsApi(request);
    this.trades = new TradesApi(request);
    this.health = new HealthApi(request);
  }
}

export { AccountsApi, TradesApi };
export type * from "./types";
