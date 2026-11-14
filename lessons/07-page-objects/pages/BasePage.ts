import { expect, type Locator, type Page } from "@playwright/test";

/** What every journal page has: a main heading, the side menu and the Back button. */
export class BasePage {
  readonly heading: Locator;
  readonly backButton: Locator;

  constructor(readonly page: Page, readonly path: string, readonly title: string) {
    this.heading = page.getByRole("heading", { level: 1 });
    this.backButton = page.getByTestId("back-button");
  }

  async open() {
    await this.page.goto(this.path);
    await expect(this.heading).toContainText(this.title);
    return this;
  }

  menuLink(name: string) {
    return this.page.getByRole("link", { name, exact: true });
  }
}
