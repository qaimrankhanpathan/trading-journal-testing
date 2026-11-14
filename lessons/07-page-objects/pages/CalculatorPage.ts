import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/** The Position size page (/calculator/). */
export class CalculatorPage extends BasePage {
  readonly account: Locator;
  readonly symbol: Locator;
  readonly entry: Locator;
  readonly stopLoss: Locator;
  readonly resultCard: Locator;

  constructor(page: Page) {
    super(page, "/calculator/", "Position size");
    this.account = page.getByLabel("Account");
    this.symbol = page.getByLabel("Symbol");
    this.entry = page.getByLabel("Entry");
    this.stopLoss = page.getByLabel("Stop loss");
    this.resultCard = page.locator(".card", { has: page.getByRole("heading", { name: "Result" }) });
  }

  /** One figure from the Result card, e.g. figure("Risk") -> the <b>$50.00</b> next to "Risk". */
  figure(label: "Lots" | "Risk" | "Profit at target") {
    return this.page.locator(`div:has(> span:text-is('${label}')) > b`);
  }

  async size(o: { accountId: number; symbol: string; side: "Buy" | "Sell"; entry: string; stop: string }) {
    await this.account.selectOption(String(o.accountId));
    await this.symbol.selectOption(o.symbol);
    await this.page.getByRole("button", { name: o.side, exact: true }).click();
    await this.entry.fill(o.entry);
    await this.stopLoss.fill(o.stop);
  }

  /** The risk shown, as a number of dollars. Waits until a figure is shown. */
  async riskDollars() {
    const text = await this.figure("Risk").innerText();
    return Number(text.replace(/[$,]/g, ""));
  }
}
