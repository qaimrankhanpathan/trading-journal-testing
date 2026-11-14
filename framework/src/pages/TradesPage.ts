import { expect, type Locator, type Page } from "@playwright/test";
import { step } from "../utils/step";
import { BasePage } from "./BasePage";

export type TradeFormValues = {
  account: string; // the account id, as the form's <option value>
  symbol: string;
  direction: "buy" | "sell";
  lots: string;
  openTime: string; // "2026-10-14T09:00"
  closeTime?: string;
  entry: string;
  exit?: string;
  stopLoss?: string;
  fees?: string;
};

/** COMPONENT: the "Log a trade" / "Edit trade" pop-up form. */
export class TradeForm {
  readonly root: Locator;
  readonly error: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.root = page.locator("form.modal");
    this.error = this.root.locator(".error");
    this.saveButton = this.root.getByRole("button", { name: "Save trade" });
  }

  field(label: string): Locator {
    return this.root.getByLabel(label, { exact: false }).first();
  }

  @step("Fill in the trade form")
  async fill(v: Partial<TradeFormValues>): Promise<void> {
    if (v.account) await this.field("Account").selectOption(v.account);
    if (v.symbol) await this.fillOrSelect("Symbol", v.symbol);
    if (v.direction) await this.field("Direction").selectOption(v.direction);
    if (v.lots) await this.field("Lots").fill(v.lots);
    if (v.openTime) await this.field("Open time").fill(v.openTime);
    if (v.closeTime) await this.field("Close time").fill(v.closeTime);
    if (v.entry) await this.field("Entry price").fill(v.entry);
    if (v.exit) await this.field("Exit price").fill(v.exit);
    if (v.stopLoss) await this.root.getByRole("spinbutton", { name: "Stop loss", exact: true }).fill(v.stopLoss);
    if (v.fees) await this.field("Fees / commission").fill(v.fees);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  private async fillOrSelect(label: string, value: string): Promise<void> {
    const el = this.field(label);
    if ((await el.evaluate((e) => e.tagName)) === "SELECT") await el.selectOption(value);
    else await el.fill(value);
  }
}

/** The Trades page (/trades/): the list of trades, filters, and the Log trade form. */
export class TradesPage extends BasePage {
  readonly path = "/trades/";
  readonly title = "Trades";
  readonly logTradeButton: Locator;
  readonly rows: Locator;
  readonly form: TradeForm;

  constructor(page: Page) {
    super(page);
    this.logTradeButton = page.getByRole("button", { name: "+ Log trade" });
    this.rows = page.locator(".trades-table tbody tr");
    this.form = new TradeForm(page);
  }

  @step("Show trades of all time")
  async showAllTime(): Promise<void> {
    await this.page.getByRole("button", { name: "All time" }).click();
  }

  rowFor(text: string): Locator {
    return this.rows.filter({ hasText: text });
  }

  @step("Log a trade through the form")
  async logTrade(values: TradeFormValues): Promise<void> {
    await this.logTradeButton.click();
    await expect(this.form.root).toBeVisible();
    await this.form.fill(values);
    await this.form.save();
  }
}
