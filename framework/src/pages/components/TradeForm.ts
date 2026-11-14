import type { Locator, Page } from "@playwright/test";
import { step } from "../../utils/step";

export type TradeFormValues = {
  account: string; // the account id, as the form's <option value>
  symbol: string;
  direction: "buy" | "sell";
  lots: string;
  openTime: string; // "2026-10-14T09:00"
  closeTime: string;
  entry: string;
  exit: string;
  stopLoss: string;
  fees: string;
};

/** COMPONENT: the "Log a trade" / "Edit trade" pop-up form on the Trades page. */
export class TradeForm {
  readonly root: Locator;
  readonly error: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.root = page.locator("form.modal");
    this.error = this.root.locator(".error");
    this.saveButton = this.root.getByRole("button", { name: "Save trade" });
    this.closeButton = this.root.getByRole("button", { name: "Close", exact: true });
  }

  field(label: string): Locator {
    return this.root.getByLabel(label, { exact: false }).first();
  }

  /** Fills only the fields given. An empty string clears a field. */
  @step("Fill in the trade form")
  async fill(v: Partial<TradeFormValues>): Promise<void> {
    if (v.account !== undefined) await this.field("Account").selectOption(v.account);
    if (v.symbol !== undefined) await this.fillOrSelect(this.field("Symbol"), v.symbol);
    if (v.direction !== undefined) await this.field("Direction").selectOption(v.direction);
    if (v.lots !== undefined) await this.field("Lots").fill(v.lots);
    if (v.openTime !== undefined) await this.field("Open time").fill(v.openTime);
    if (v.closeTime !== undefined) await this.field("Close time").fill(v.closeTime);
    if (v.entry !== undefined) await this.field("Entry price").fill(v.entry);
    if (v.exit !== undefined) await this.field("Exit price").fill(v.exit);
    if (v.stopLoss !== undefined) await this.root.getByRole("spinbutton", { name: "Stop loss", exact: true }).fill(v.stopLoss);
    if (v.fees !== undefined) await this.field("Fees / commission").fill(v.fees);
  }

  @step("Save the trade form")
  async save(): Promise<void> {
    await this.saveButton.click();
  }

  private async fillOrSelect(el: Locator, value: string): Promise<void> {
    if ((await el.evaluate((e) => e.tagName)) === "SELECT") await el.selectOption(value);
    else await el.fill(value);
  }
}
