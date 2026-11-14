import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright settings for the whole learning project.
 *
 * SAFETY: every test runs against the journal TEST COPY on port 8001 (start it with start-test.bat).
 * support/global-setup.ts checks this before any test runs and stops everything if it finds your real journal.
 */
const JOURNAL_URL = process.env.JOURNAL_URL ?? "http://localhost:8001";

// Which browser to use. On Windows we use Microsoft Edge, which is already installed, so there is nothing to download.
// Set PW_CHANNEL=chromium to use Playwright's own Chromium instead (after `npx playwright install chromium`).
const channelEnv = process.env.PW_CHANNEL ?? (process.platform === "win32" ? "msedge" : "chromium");
const channel = channelEnv === "chromium" ? undefined : channelEnv;

export default defineConfig({
  testDir: "./lessons",
  globalSetup: require.resolve("./support/global-setup"),
  timeout: 30_000, // one test may take at most 30 seconds
  expect: { timeout: 5_000 }, // an expect() keeps retrying for up to 5 seconds
  fullyParallel: false,
  workers: 1, // one test at a time: easier to follow while learning (lesson 9 shows how to speed up)
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: JOURNAL_URL, // page.goto("/accounts/") means http://localhost:8001/accounts/
    channel,
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure", // lesson 8: a recording of every failed test
    screenshot: "only-on-failure",
  },
  projects: [
    // Your work: the exercise files. Run with `npm test`.
    { name: "exercises", testMatch: "**/exercise.spec.ts" },
    // The worked answers. Run with `npm run solutions`.
    { name: "solutions", testMatch: "**/solution.spec.ts" },
    // Lesson 9: the same solutions on a phone-sized screen. Run with `npx playwright test --project=phone`.
    {
      name: "phone",
      testMatch: "**/solution.spec.ts",
      grep: /@phone/,
      use: { ...devices["Pixel 7"], channel },
    },
  ],
});
