import type { Locator, Page } from "@playwright/test";
import { step } from "../utils/step";
import { BasePage } from "./BasePage";

/** The "Add account" form on the Accounts page. Firm, program and size come from the journal's prop firm catalogue. */
export class AccountForm {
  readonly firm: Locator;
  readonly program: Locator;
  readonly phase: Locator;
  readonly name: Locator;
  readonly size: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.firm = page.getByRole("combobox", { name: "Prop firm" });
    this.program = page.getByRole("combobox", { name: "Program" });
    this.phase = page.getByRole("combobox", { name: /^Phase/ }).first();
    this.name = page.getByRole("textbox", { name: "Account name" });
    this.size = page.getByRole("combobox", { name: "Account size" });
    this.saveButton = page.getByRole("button", { name: /^Save/ });
  }
}

export class AccountsPage extends BasePage {
  readonly path = "/accounts/";
  readonly title = "Accounts";
  readonly addButton: Locator;
  readonly form: AccountForm;

  constructor(page: Page) {
    super(page);
    this.addButton = page.getByRole("button", { name: "+ Add account" });
    this.form = new AccountForm(page);
  }

  /** The table row of one account. */
  row(accountName: string): Locator {
    return this.page.getByRole("row").filter({ hasText: accountName });
  }

  /** Fills in and saves the Add account form. The journal asks to confirm the account type: this accepts. */
  @step("Add an account through the form")
  async addAccount(o: { firm: string; program?: string; size: string; name: string }): Promise<void> {
    await this.addButton.click();
    await this.form.firm.selectOption(o.firm);
    if (o.program) await this.form.program.selectOption(o.program);
    await this.form.size.selectOption(o.size);
    await this.form.name.fill(o.name);
    this.acceptNextDialog();
    await this.form.saveButton.click();
  }
}
