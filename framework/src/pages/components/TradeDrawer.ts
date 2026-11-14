import type { Locator, Page } from "@playwright/test";
import { step } from "../../utils/step";

export type Grade = "A" | "B" | "C" | "D";

/** COMPONENT: the side panel that opens when you click a trade: grade, tags, lesson, reviewed, delete. */
export class TradeDrawer {
  readonly root: Locator;
  readonly reviewedBadge: Locator;
  readonly tagInput: Locator;
  readonly lesson: Locator;
  readonly saveButton: Locator;
  readonly reviewedButton: Locator;
  readonly notReviewedButton: Locator;
  readonly deleteButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.root = page.locator("aside.drawer[role=dialog]");
    this.reviewedBadge = this.root.locator(".pill", { hasText: "Reviewed" });
    this.tagInput = this.root.locator(".tag-input input");
    this.lesson = this.root.getByLabel("Lesson");
    this.saveButton = this.root.getByRole("button", { name: "Save", exact: true });
    this.reviewedButton = this.root.getByRole("button", { name: /^Reviewed/ });
    this.notReviewedButton = this.root.getByRole("button", { name: "Mark not reviewed" });
    this.deleteButton = this.root.getByRole("button", { name: "Delete", exact: true });
    this.closeButton = this.root.getByRole("button", { name: "Close", exact: true });
  }

  gradeButton(grade: Grade): Locator {
    return this.root.getByRole("group", { name: "Grade" }).locator(`.grade-btn.g${grade}`);
  }

  tag(name: string): Locator {
    return this.root.locator(".tag-input").getByText(name, { exact: true });
  }

  @step("Grade the trade")
  async grade(grade: Grade): Promise<void> {
    await this.gradeButton(grade).click();
  }

  @step("Add a tag")
  async addTag(tag: string): Promise<void> {
    await this.tagInput.fill(tag);
    await this.tagInput.press("Enter");
  }

  @step("Write the lesson")
  async writeLesson(text: string): Promise<void> {
    await this.lesson.fill(text);
  }

  @step("Save the review")
  async save(): Promise<void> {
    await this.saveButton.click();
  }

  @step("Mark the trade reviewed")
  async markReviewed(): Promise<void> {
    await this.reviewedButton.click();
  }

  @step("Close the trade panel")
  async close(): Promise<void> {
    await this.closeButton.click();
  }
}
