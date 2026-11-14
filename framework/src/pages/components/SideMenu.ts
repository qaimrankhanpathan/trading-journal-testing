import type { Locator, Page } from "@playwright/test";
import { step } from "../../utils/step";

/**
 * COMPONENT OBJECT: a piece of screen that appears on many pages. The side menu is on every page, so it is its own
 * class and every page object HAS one (composition), instead of each page repeating the same locators.
 */
export class SideMenu {
  readonly root: Locator;
  readonly morePages: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole("navigation").first();
    this.morePages = this.root.getByRole("button", { name: "More pages" });
  }

  link(name: string): Locator {
    return this.root.getByRole("link", { name, exact: true });
  }

  /** Clicks a menu entry. Pages outside "Trading day" sit under "More pages", which is opened first if needed. */
  @step("Go to a page from the side menu")
  async goTo(name: string): Promise<void> {
    if (!(await this.link(name).isVisible()) && (await this.morePages.isVisible())) {
      await this.morePages.click();
    }
    await this.link(name).click();
  }
}
