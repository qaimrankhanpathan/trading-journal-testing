import type { Locator, Page } from "@playwright/test";
import { parseMoney } from "../utils/money";
import { step } from "../utils/step";
import { BasePage } from "./BasePage";

export type ResultFigure = "Lots" | "Risk" | "Profit at target";

/** The Position size calculator (/calculator/): turns entry, stop and the account's risk into a lot size. */
export class CalculatorPage extends BasePage {
  readonly path = "/calculator/";
  readonly title = "Position size";
  readonly account: Locator;
  readonly symbol: Locator;
  readonly entry: Locator;
  readonly stopLoss: Locator;

  constructor(page: Page) {
    super(page);
    this.account = page.getByLabel("Account");
    this.symbol = page.getByLabel("Symbol");
    this.entry = page.getByLabel("Entry");
    this.stopLoss = page.getByLabel("Stop loss");
  }

  /** One figure of the Result card, e.g. figure("Risk") is the "$50.00" next to "Risk". */
  figure(label: ResultFigure): Locator {
    return this.page.locator(`div:has(> span:text-is('${label}')) > b`);
  }

  @step("Size a position")
  async size(o: { accountId: number; symbol: string; side: "Buy" | "Sell"; entry: string; stop: string }): Promise<void> {
    await this.account.selectOption(String(o.accountId));
    await this.symbol.selectOption(o.symbol);
    await this.page.getByRole("button", { name: o.side, exact: true }).click();
    await this.entry.fill(o.entry);
    await this.stopLoss.fill(o.stop);
  }

  /** The dollar risk shown, as a number. */
  async riskDollars(): Promise<number> {
    return parseMoney(await this.figure("Risk").innerText());
  }
}
