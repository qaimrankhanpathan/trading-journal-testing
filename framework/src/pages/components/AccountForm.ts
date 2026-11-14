import { expect, type Locator, type Page } from "@playwright/test";
import { step } from "../../utils/step";

export type AccountFormValues = {
  firm: string;
  program: string;
  size: string; // an option of "Account size", e.g. "100000"
  name: string;
  platform: string; // an option of "Platform", e.g. "Other (type a name)"
  targetPct: string;
};

/** COMPONENT: the Add / Edit account form on the Accounts page. */
export class AccountForm {
  readonly root: Locator;
  readonly error: Locator;
  readonly firm: Locator;
  readonly program: Locator;
  readonly name: Locator;
  readonly platform: Locator;
  readonly size: Locator;
  readonly target: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.root = page.locator("form", { has: page.getByRole("button", { name: "Save account" }) });
    this.error = this.root.locator(".error");
    this.firm = this.root.getByRole("combobox", { name: "Prop firm" });
    this.program = this.root.getByRole("combobox", { name: "Program" });
    this.name = this.root.getByRole("textbox", { name: "Account name" });
    this.platform = this.root.getByRole("combobox", { name: "Platform" });
    this.size = this.root.getByRole("combobox", { name: "Account size" });
    this.target = this.root.getByRole("spinbutton", { name: /^Current phase target %/ });
    this.saveButton = this.root.getByRole("button", { name: "Save account" });
    this.cancelButton = this.root.getByRole("button", { name: "Cancel", exact: true });
  }

  /**
   * Waits until the prop firm catalogue has loaded into the new-account form. Choosing a firm before that leaves the
   * previous firm's program selected, and the "Account size" list never appears. (Found running 4 tests at once.)
   */
  async waitForCatalogue(): Promise<void> {
    await expect(this.root.getByText(/^from the prop firm catalogue/)).toBeVisible();
  }

  @step("Fill in the account form")
  async fill(v: Partial<AccountFormValues>): Promise<void> {
    if (v.firm !== undefined) await this.firm.selectOption(v.firm);
    if (v.program !== undefined) await this.program.selectOption(v.program);
    if (v.size !== undefined) await this.size.selectOption(v.size);
    if (v.platform !== undefined) await this.platform.selectOption(v.platform);
    if (v.name !== undefined) await this.name.fill(v.name);
    if (v.targetPct !== undefined) await this.target.fill(v.targetPct);
  }

  @step("Save the account form")
  async save(): Promise<void> {
    await this.saveButton.click();
  }

  @step("Cancel the account form")
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
