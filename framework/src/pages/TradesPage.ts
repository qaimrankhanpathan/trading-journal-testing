import { expect, type Locator, type Page } from "@playwright/test";
import { step } from "../utils/step";
import { BasePage } from "./BasePage";
import { FilterBar } from "./components/FilterBar";
import { TradeDrawer } from "./components/TradeDrawer";
import { TradeForm, type TradeFormValues } from "./components/TradeForm";

/** The Trades page (/trades/): the list of trades, its filters, the Log trade form and the review panel. */
export class TradesPage extends BasePage {
  readonly path = "/trades/";
  readonly title = "Trades";
  readonly logTradeButton: Locator;
  readonly rows: Locator;
  readonly emptyState: Locator;
  readonly showAllTradesButton: Locator;
  readonly filters: FilterBar;
  readonly form: TradeForm;
  readonly drawer: TradeDrawer;

  constructor(page: Page) {
    super(page);
    this.logTradeButton = page.getByRole("button", { name: "+ Log trade" });
    this.rows = page.locator(".trades-table tbody tr");
    this.emptyState = page.locator(".trades-table .empty");
    this.showAllTradesButton = page.getByRole("button", { name: "Show all trades" });
    this.filters = new FilterBar(page);
    this.form = new TradeForm(page);
    this.drawer = new TradeDrawer(page);
  }

  /** Opens the page and waits for its first list of trades, so a filter change never races the first load. */
  override async open(): Promise<this> {
    const firstList = this.page.waitForResponse((r) => new URL(r.url()).pathname === "/api/trades" && r.request().method() === "GET");
    await super.open();
    await firstList;
    return this;
  }

  rowFor(text: string): Locator {
    return this.rows.filter({ hasText: text });
  }

  reviewListButton(name: "All trades" | "To review" | "Reviewed"): Locator {
    return this.page.getByRole("group", { name: "Review list" }).getByRole("button", { name: new RegExp(`^${name}`) });
  }

  /**
   * Shows only one account's trades, of all time. Tests use this instead of scrolling the whole list: the test copy
   * holds all your real trades too, and the list is split into pages.
   *
   * It WAITS until the list really shows only that account. The filter reloads the list in the background; a test
   * that clicks a row too early clicks another account's trade. (Found running 4 tests at once: it made 3 tests flaky.)
   */
  @step("Show one account's trades")
  async showAccount(account: { id: number; name: string }): Promise<void> {
    await this.filters.period("All time");
    await this.filters.byAccount(account.id);
    await this.waitForOnly(account.name);
  }

  /** Waits until no listed row belongs to another account (rows show their account's name). */
  async waitForOnly(accountName: string): Promise<void> {
    await expect(this.rows.filter({ hasNotText: accountName })).toHaveCount(0);
  }

  @step("Show trades of all time")
  async showAllTime(): Promise<void> {
    await this.filters.period("All time");
  }

  @step("Pick a review list")
  async reviewList(name: "All trades" | "To review" | "Reviewed"): Promise<void> {
    await this.reviewListButton(name).click();
    await expect(this.reviewListButton(name)).toHaveClass(/\bon\b/);
  }

  @step("Open the Log trade form")
  async startLogTrade(): Promise<TradeForm> {
    await this.logTradeButton.click();
    await expect(this.form.root).toBeVisible();
    return this.form;
  }

  @step("Log a trade through the form")
  async logTrade(values: TradeFormValues): Promise<void> {
    const form = await this.startLogTrade();
    await form.fill(values);
    await form.save();
  }

  @step("Open a trade's edit form")
  async editTrade(row: Locator): Promise<TradeForm> {
    await row.getByRole("button", { name: "Edit trade" }).click();
    await expect(this.form.root).toBeVisible();
    return this.form;
  }

  /** Clicks a trade row to open its review panel. */
  @step("Open a trade's review panel")
  async openTrade(row: Locator): Promise<TradeDrawer> {
    // The list can redraw right after a filter change; retry until the panel is open.
    await expect(async () => {
      await row.locator("td").nth(1).click();
      await expect(this.drawer.root).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 15_000 });
    return this.drawer;
  }

  /** Deletes a trade from its review panel. `confirm` answers the "Delete ... trade?" question. */
  @step("Delete a trade")
  async deleteTrade(row: Locator, confirm = true): Promise<void> {
    const drawer = await this.openTrade(row);
    if (confirm) this.acceptNextDialog();
    else this.dismissNextDialog();
    await drawer.deleteButton.click();
  }
}

export type { TradeFormValues };
