import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/** The Dashboard (/): one card per account with its balance and progress. */
export class DashboardPage extends BasePage {
  readonly path = "/";
  readonly title = "Dashboard";

  accountCard(accountName: string): Locator {
    return this.page.locator(".acc-card, .acc-row").filter({ hasText: accountName });
  }
}
