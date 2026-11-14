import { ApiClient } from "./ApiClient";
import type { Trade, TradeInput } from "./types";

/** /api/trades: the journal works out each trade's P&L from prices, lots and the symbol's pip value. */
export class TradesApi extends ApiClient {
  forAccount(accountId: number): Promise<Trade[]> {
    return this.expectJson("GET", `/api/trades?account_id=${accountId}`, 200);
  }

  get(id: number): Promise<Trade> {
    return this.expectJson("GET", `/api/trades/${id}`, 200);
  }

  create(input: TradeInput): Promise<Trade> {
    return this.expectJson("POST", "/api/trades", 201, input);
  }

  async update(id: number, changes: Partial<TradeInput>): Promise<Trade> {
    const current = await this.get(id);
    return this.expectJson("PUT", `/api/trades/${id}`, 200, { ...current, ...changes });
  }

  async delete(id: number): Promise<void> {
    const res = await this.send("DELETE", `/api/trades/${id}`);
    if (![204, 404].includes(res.status())) throw new Error(`DELETE /api/trades/${id} answered ${res.status()}`);
  }

  /** The trade with this id, or undefined when there is none. */
  async find(id: number): Promise<Trade | undefined> {
    const res = await this.getRaw(id);
    return res.ok() ? ((await res.json()) as Trade) : undefined;
  }

  createRaw(input: Record<string, unknown>) {
    return this.send("POST", "/api/trades", input);
  }

  getRaw(id: number) {
    return this.send("GET", `/api/trades/${id}`);
  }
}
