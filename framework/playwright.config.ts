import { defineConfig, devices } from "@playwright/test";
import { env } from "./config/env";

/**
 * FRAMEWORK CONFIG. Run it with `-c framework` (the npm scripts do this for you):
 *
 *   npm run fw:test         everything
 *   npm run fw:smoke        only @smoke tests (fast)
 *   npm run fw:api          only the API project (no browser)
 *
 * Every value that changes between machines (address, browser, workers, retries) comes from config/env.ts,
 * never from here. The lessons keep their own config in ../playwright.config.ts: the two never mix.
 */
const channel = env.channel === "chromium" ? undefined : env.channel;

export default defineConfig({
  testDir: "./tests",
  globalSetup: require.resolve("./src/safety/global-setup"),

  // Every test is independent (own data, own browser context), so they can run at the same time.
  fullyParallel: true,
  workers: env.workers,
  retries: env.retries,
  // A forgotten test.only() would silently skip the rest of the suite on a CI server: fail instead.
  forbidOnly: env.isCI,

  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Where traces, screenshots and videos of failed tests go.
  outputDir: "./reports/test-results",

  // REPORTERS: several at once, each for a different reader.
  //   list  -> you, in the terminal, while it runs
  //   html  -> you, after the run: npm run fw:report (steps, traces, screenshots of failures)
  //   junit -> machines: CI servers and test-management tools read this XML
  reporter: [["list"], ["html", { outputFolder: "./reports/html", open: "never" }], ["junit", { outputFile: "./reports/junit.xml" }]],

  use: {
    baseURL: env.baseURL,
    channel,
    headless: env.headless,
    launchOptions: { slowMo: env.slowMo },
    viewport: { width: 1440, height: 900 },
    // EVIDENCE ON FAILURE: kept only when a test fails, so passing runs stay fast and small.
    trace: "retain-on-failure", // a full recording: every action, network call, console line and DOM snapshot
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  // PROJECTS: the same suite in different set-ups. Pick one with --project=<name>.
  projects: [
    {
      // API tests need no browser at all: much faster.
      name: "api",
      testDir: "./tests/api",
    },
    {
      name: "desktop",
      testDir: "./tests",
      testIgnore: "api/**",
    },
    {
      // A phone-sized screen. Only the @smoke page checks run here: enough to catch a broken phone layout.
      name: "phone",
      testDir: "./tests/ui",
      grep: /@smoke/,
      use: { ...devices["Pixel 7"], channel },
    },
  ],
});
