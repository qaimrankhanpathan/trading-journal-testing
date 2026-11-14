import { test, expect, TAG } from "@fixtures";
import { uniqueName } from "@utils";

// FEATURE: Reviewing trades in the side panel (docs/TEST_PLAN.md, TC-REV-*).

test.describe("Trade review", { tag: [TAG.FUNCTIONAL, TAG.REGRESSION] }, () => {
  test("TC-REV-01 clicking a trade opens its review panel", async ({ data, tradesPage }) => {
    const account = await data.account();
    await data.trade(account.id);

    await tradesPage.open();
    await tradesPage.showAccount(account);
    const drawer = await tradesPage.openTrade(tradesPage.rows.first());

    await expect(drawer.root).toContainText("EURUSD");
    await expect(drawer.gradeButton("A")).toBeVisible();
  });

  test("TC-REV-02 grade, tag and write a lesson: all three are saved", async ({ data, api, tradesPage }) => {
    const account = await data.account();
    const trade = await data.trade(account.id);
    const lesson = uniqueName("Lesson");

    await tradesPage.open();
    await tradesPage.showAccount(account);
    const drawer = await tradesPage.openTrade(tradesPage.rows.first());
    await drawer.grade("B");
    await drawer.addTag("framework tag");
    await drawer.writeLesson(lesson);
    await drawer.save();

    await expect.poll(async () => (await api.trades.get(trade.id)).grade).toBe("B");
    const saved = await api.trades.get(trade.id);
    expect(saved.tags).toContain("framework tag");
    expect(saved.notes).toBe(lesson);
  });

  // Note: "To review" lists only trades the journal judges. Practice trades are pre-journal, so this test
  // checks the "Reviewed" list and the panel instead.
  test("TC-REV-03 mark a trade reviewed: it is listed under 'Reviewed'", async ({ data, api, tradesPage }) => {
    const account = await data.account();
    const trade = await data.trade(account.id);

    await tradesPage.open();
    await tradesPage.showAccount(account);
    await tradesPage.reviewList("Reviewed");
    await expect(tradesPage.rows).toHaveCount(0);

    await tradesPage.reviewList("All trades");
    const drawer = await tradesPage.openTrade(tradesPage.rows.first());
    await drawer.grade("A");
    await drawer.markReviewed();
    await expect.poll(async () => (await api.trades.get(trade.id)).reviewed_at).toBeTruthy();

    await tradesPage.page.reload();
    await tradesPage.showAccount(account);
    await tradesPage.reviewList("Reviewed");
    await expect(tradesPage.rows).toHaveCount(1);
  });

  test("TC-REV-04 'Mark not reviewed' puts a reviewed trade back", async ({ data, api, tradesPage }) => {
    const account = await data.account();
    const trade = await data.trade(account.id);

    await tradesPage.open();
    await tradesPage.showAccount(account);
    let drawer = await tradesPage.openTrade(tradesPage.rows.first());
    await drawer.markReviewed();
    await expect.poll(async () => (await api.trades.get(trade.id)).reviewed_at).toBeTruthy();

    await tradesPage.page.reload();
    await tradesPage.showAccount(account);
    drawer = await tradesPage.openTrade(tradesPage.rows.first());
    await expect(drawer.reviewedBadge).toBeVisible();
    await drawer.notReviewedButton.click();

    await expect.poll(async () => (await api.trades.get(trade.id)).reviewed_at).toBeFalsy();
  });

  test("TC-REV-05 an open trade cannot be marked reviewed yet", { tag: TAG.NEGATIVE }, async ({ data, tradesPage }) => {
    const account = await data.account();
    await data.trade(account.id, (t) => t.open());

    await tradesPage.open();
    await tradesPage.showAccount(account);
    const drawer = await tradesPage.openTrade(tradesPage.rows.first());

    await expect(drawer.reviewedButton).toBeDisabled();
  });

  test("TC-REV-06 the panel closes with its Close button", async ({ data, tradesPage }) => {
    const account = await data.account();
    await data.trade(account.id);

    await tradesPage.open();
    await tradesPage.showAccount(account);
    const drawer = await tradesPage.openTrade(tradesPage.rows.first());
    await drawer.close();

    await expect(drawer.root).toBeHidden();
  });
});
