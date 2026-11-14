import type { Locator, Page } from "@playwright/test";
import { step } from "../utils/step";
import { BasePage } from "./BasePage";
import { AccountForm, type AccountFormValues } from "./components/AccountForm";
import { RowMenu } from "./components/RowMenu";

/** The Accounts page (/accounts/): the table of prop firm accounts, and the Add / Edit account form. */
export class AccountsPage extends BasePage {
  readonly path = "/accounts/";
  readonly title = "Accounts";
  readonly addButton: Locator;
  readonly form: AccountForm;
  readonly pageError: Locator;

  constructor(page: Page) {
    super(page);
    this.addButton = page.getByRole("button", { name: "+ Add account" });
    this.form = new AccountForm(page);
    this.pageError = page.locator("main > .error, .error").first();
  }

  /** The table row of one account. */
  row(accountName: string): Locator {
    return this.page.getByRole("row").filter({ has: this.page.getByRole("cell", { name: accountName, exact: true }) });
  }

  /** One cell of an account's row, by column name. */
  cell(accountName: string, column: "Firm / program" | "Phase" | "Platform" | "Start balance" | "Target" | "Status" | "Trades"): Locator {
    const columns = ["Name", "Firm / program", "Phase", "Platform", "Start balance", "Target", "Daily", "Max DD", "Status", "Trades"];
    return this.row(accountName).getByRole("cell").nth(columns.indexOf(column));
  }

  /** Opens an empty Add account form, ready to fill in. */
  @step("Open the Add account form")
  async startAdd(): Promise<AccountForm> {
    await this.addButton.click();
    await this.form.waitForCatalogue();
    return this.form;
  }

  /**
   * Fills in and saves the Add account form. The journal asks "Add this as a main account?": `confirm` decides the
   * answer (true = OK, false = Cancel).
   */
  @step("Add an account through the form")
  async addAccount(values: Partial<AccountFormValues> & { name: string }, confirm = true): Promise<void> {
    await this.startAdd();
    await this.form.fill(values);
    if (confirm) this.acceptNextDialog();
    else this.dismissNextDialog();
    await this.form.save();
  }

  @step("Open an account for editing")
  async edit(accountName: string): Promise<AccountForm> {
    await this.row(accountName).getByRole("button", { name: "Edit", exact: true }).click();
    return this.form;
  }

  /** Deletes an account from its row menu. `confirm` answers the "This cannot be undone" question. */
  @step("Delete an account")
  async deleteAccount(accountName: string, confirm = true): Promise<void> {
    if (confirm) this.acceptNextDialog();
    else this.dismissNextDialog();
    await new RowMenu(this.row(accountName)).choose("Delete account");
  }
}
