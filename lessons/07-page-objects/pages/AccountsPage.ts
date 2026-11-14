import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AccountsPage extends BasePage {
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page, "/accounts/", "Accounts");
    this.addButton = page.getByRole("button", { name: "+ Add account" });
  }

  /** The table row for one account. */
  row(accountName: string) {
    return this.page.getByRole("row").filter({ hasText: accountName });
  }
}
