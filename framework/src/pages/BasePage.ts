import { expect, type Locator, type Page } from "@playwright/test";
import { step } from "../utils/step";
import { SideMenu } from "./components/SideMenu";

/**
 * BASE PAGE: what every journal page has. Each page object extends it and adds only its own controls.
 *
 * Rules the page objects in this folder follow (the same rules most teams write in their style guide):
 *  1. Locators live here, never in tests. A screen change is fixed in ONE file.
 *  2. Prefer user-facing locators: getByRole, getByLabel, getByText. CSS classes are a last resort.
 *  3. Methods describe what a USER does ("logTrade"), not how ("clickButton3").
 *  4. Page objects do not assert test results. They return locators and values; the TEST decides what is right.
 *     The one exception is waiting until a page is ready (open() below), which is part of "doing the action".
 */
export abstract class BasePage {
  readonly heading: Locator;
  readonly menu: SideMenu;
  readonly backButton: Locator;
  readonly testCopyBanner: Locator;

  /** Where the page lives, e.g. "/trades/". */
  abstract readonly path: string;
  /** Text in the page's main heading, used to know the page has opened. */
  abstract readonly title: string;

  constructor(readonly page: Page) {
    this.heading = page.getByRole("heading", { level: 1 });
    this.menu = new SideMenu(page);
    this.backButton = page.getByTestId("back-button");
    this.testCopyBanner = page.getByRole("status").filter({ hasText: "TEST COPY" });
  }

  /** Opens the page and waits until its heading is shown. Returns the page object, so calls can be chained. */
  @step() // no name given: the report shows "TradesPage.open", "AccountsPage.open", ...
  async open(): Promise<this> {
    await this.page.goto(this.path);
    await this.waitUntilShown();
    return this;
  }

  async waitUntilShown(): Promise<void> {
    await expect(this.heading).toContainText(this.title);
  }

  /** Accepts the next browser confirm() box (the journal asks "Are you sure?" before some saves and deletes). */
  acceptNextDialog(): void {
    this.page.once("dialog", (dialog) => void dialog.accept());
  }

  dismissNextDialog(): void {
    this.page.once("dialog", (dialog) => void dialog.dismiss());
  }
}
