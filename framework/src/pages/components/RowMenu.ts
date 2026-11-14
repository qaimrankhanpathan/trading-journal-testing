import type { Locator } from "@playwright/test";
import { step } from "../../utils/step";

/** COMPONENT: the "More actions" (⋯) menu at the end of a table row, which holds rare and risky actions like Delete. */
export class RowMenu {
  readonly button: Locator;

  constructor(private readonly row: Locator) {
    this.button = row.getByRole("button", { name: "More actions" });
  }

  @step("Choose an action from the row menu")
  async choose(action: string): Promise<void> {
    await this.button.click();
    await this.row.getByRole("menuitem", { name: action }).click();
  }
}
