import type { Locator, Page } from "@playwright/test";
import { step } from "../../utils/step";

/**
 * COMPONENT: the filter bar above the trades list: account, period, search, and "More filters".
 *
 * Every change makes the page ask the server for the list again. Each method here WAITS for that answer before it
 * returns. Why: the journal does not ignore an older answer that arrives late, so two quick filter changes can end
 * with the list of the FIRST change on screen. Waiting for each answer keeps the tests honest about what they see.
 * (Found by running these tests 4 at a time; see docs/TEST_PLAN.md, "Findings".)
 */
export class FilterBar {
  readonly root: Locator;
  readonly account: Locator;
  readonly search: Locator;
  readonly moreFilters: Locator;
  readonly side: Locator;
  readonly clearButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator(".card.filters");
    this.account = this.root.getByRole("combobox", { name: "Account", exact: true });
    this.search = this.root.getByRole("textbox", { name: "Search notes" });
    this.moreFilters = this.root.getByRole("button", { name: /More filters|Fewer filters/ });
    this.side = this.root.locator("label.field", { hasText: "Side" }).locator("select");
    this.clearButton = this.root.getByRole("button", { name: "Clear", exact: true });
  }

  periodButton(label: string): Locator {
    return this.root.getByRole("group", { name: "Period" }).getByRole("button", { name: label, exact: true });
  }

  @step("Pick a period")
  async period(label: string): Promise<void> {
    await this.listReloadAfter(() => this.periodButton(label).click());
  }

  /** Picks the account by its id (the option value), so a similar name can never be picked by mistake. */
  @step("Filter by account")
  async byAccount(accountId: number): Promise<void> {
    await this.listReloadAfter(() => this.account.selectOption(String(accountId)));
  }

  @step("Search the notes")
  async searchFor(text: string): Promise<void> {
    await this.listReloadAfter(() => this.search.fill(text));
  }

  @step("Filter by side")
  async bySide(side: "buy" | "sell" | ""): Promise<void> {
    if (!(await this.side.isVisible())) await this.moreFilters.click();
    await this.listReloadAfter(() => this.side.selectOption(side));
  }

  @step("Clear all filters")
  async clear(): Promise<void> {
    await this.listReloadAfter(() => this.clearButton.click());
  }

  /** Does the change, then waits until the server has answered the new list request. */
  private async listReloadAfter(change: () => Promise<unknown>): Promise<void> {
    const answered = this.page.waitForResponse((r) => new URL(r.url()).pathname === "/api/trades" && r.request().method() === "GET");
    await change();
    await answered;
  }
}
