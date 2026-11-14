import { ApiClient } from "./ApiClient";
import type { Account, AccountInput } from "./types";

/** /api/accounts: create, read, update and delete prop-firm accounts. */
export class AccountsApi extends ApiClient {
  list(): Promise<Account[]> {
    return this.expectJson("GET", "/api/accounts", 200);
  }

  get(id: number): Promise<Account> {
    return this.expectJson("GET", `/api/accounts/${id}`, 200);
  }

  create(input: AccountInput): Promise<Account> {
    return this.expectJson("POST", "/api/accounts", 201, input);
  }

  /** PUT replaces the whole account, so this reads it first and sends it back with the changes. */
  async update(id: number, changes: Partial<AccountInput>): Promise<Account> {
    const current = await this.get(id);
    return this.expectJson("PUT", `/api/accounts/${id}`, 200, { ...current, ...changes });
  }

  /** Deletes the account and its trades. Already gone (404) is fine, so clean-up can never fail a test. */
  async delete(id: number): Promise<void> {
    const res = await this.send("DELETE", `/api/accounts/${id}`);
    if (![204, 404].includes(res.status())) throw new Error(`DELETE /api/accounts/${id} answered ${res.status()}: ${await res.text()}`);
  }

  async findByName(name: string): Promise<Account | undefined> {
    return (await this.list()).find((a) => a.name === name);
  }

  // Raw calls for negative tests: they return the response whatever its status.
  createRaw(input: Record<string, unknown>) {
    return this.send("POST", "/api/accounts", input);
  }

  getRaw(id: number) {
    return this.send("GET", `/api/accounts/${id}`);
  }
}
