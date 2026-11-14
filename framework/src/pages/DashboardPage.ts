import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export type DashboardColumn =
  "Account" | "Stage" | "Balance" | "Today" | "Live equity" | "Profit target" | "Daily loss room" | "Drawdown room" | "Status";

const COLUMNS: DashboardColumn[] = [
  "Account",
  "Stage",
  "Balance",
  "Today",
  "Live equity",
  "Profit target",
  "Daily loss room",
  "Drawdown room",
  "Status",
];

/** The Dashboard (/): the account book, one row per account with its balance, target and room before each limit. */
export class DashboardPage extends BasePage {
  readonly path = "/";
  readonly title = "Dashboard";

  /** An account's row in the account book (or its card, on layouts that show cards). */
  accountCard(accountName: string): Locator {
    return this.page.locator(".acc-card, .acc-row").filter({ hasText: accountName });
  }

  /** One figure of an account's row, by column name, e.g. figure(name, "Balance"). */
  figure(accountName: string, column: DashboardColumn): Locator {
    return this.page.locator(".acc-book tr.acc-row").filter({ hasText: accountName }).locator("td").nth(COLUMNS.indexOf(column));
  }
}
