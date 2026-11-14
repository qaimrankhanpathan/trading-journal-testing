import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class TradesPage extends BasePage {
  readonly rows: Locator;

  constructor(page: Page) {
    super(page, "/trades/", "Trades");
    this.rows = page.locator(".trades-table tbody tr");
  }

  async showAllTime() {
    await this.page.getByRole("button", { name: "All time" }).click();
  }

  rowFor(accountName: string) {
    return this.rows.filter({ hasText: accountName });
  }
}
