import type { Locator, Page } from "@playwright/test";
import { step } from "../../utils/step";

/**
 * COMPONENT OBJECT: a piece of screen that appears on many pages. The side menu is on every page, so it is its own
 * class and every page object HAS one (composition), instead of each page repeating the same locators.
 */
export class SideMenu {
  readonly root: Locator;
  readonly morePages: Locator;
  readonly themeButton: Locator;
  readonly largerText: Locator;
  readonly smallerText: Locator;
  readonly textSizeReset: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole("navigation").first();
    this.morePages = this.root.getByRole("button", { name: "More pages" });
    this.themeButton = this.root.getByRole("button", { name: /Switch to (light|dark) theme/ });
    const textSize = this.root.getByRole("group", { name: "Text size" });
    this.largerText = textSize.getByRole("button", { name: "Larger text" });
    this.smallerText = textSize.getByRole("button", { name: "Smaller text" });
    this.textSizeReset = textSize.getByRole("button", { name: /%$/ });
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

  /** The theme the page is showing now: "dark" or "light". */
  async currentTheme(): Promise<string | null> {
    return this.page.locator("html").getAttribute("data-theme");
  }

  @step("Switch the colour theme")
  async toggleTheme(): Promise<void> {
    await this.themeButton.click();
  }
}
