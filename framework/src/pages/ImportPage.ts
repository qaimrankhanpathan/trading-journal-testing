import type { Locator, Page } from "@playwright/test";
import { step } from "../utils/step";
import { BasePage } from "./BasePage";

/** The Import / Export page (/import/). Only the CSV import is automated: MT5 and Excel imports need real files. */
export class ImportPage extends BasePage {
  readonly path = "/import/";
  readonly title = "Import";
  readonly csvSection: Locator;
  readonly csvResult: Locator;
  readonly csvError: Locator;

  constructor(page: Page) {
    super(page);
    this.csvSection = page.locator(".card", { has: page.getByRole("heading", { name: "Import CSV" }) });
    this.csvResult = this.csvSection.locator(".ok");
    this.csvError = this.csvSection.locator(".error");
  }

  /** Uploads CSV text as a file (made in memory: no file on disk needed) into an account. */
  @step("Import a CSV file")
  async importCsv(accountId: number, fileName: string, csv: string): Promise<void> {
    await this.csvSection.locator("select").first().selectOption(String(accountId));
    await this.csvSection.locator('input[type="file"]').setInputFiles({ name: fileName, mimeType: "text/csv", buffer: Buffer.from(csv) });
    await this.csvSection.getByRole("button", { name: "Import", exact: true }).click();
  }
}
