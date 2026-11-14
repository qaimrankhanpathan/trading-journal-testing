import type { FullConfig } from "@playwright/test";

/**
 * Runs once before any test. It makes sure the tests can only ever touch the journal TEST COPY.
 *
 * start-test.bat starts the journal with JOURNAL_TEST_COPY=1, and the journal then reports
 * "test_copy": true at /api/health. Your real journal (start.bat or TradingJournal.exe, port 8000) reports false.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? "http://localhost:8001";

  if (new URL(baseURL).port === "8000") {
    throw new Error("STOP: port 8000 is your REAL journal. These lessons only run against the test copy on port 8001.");
  }

  let health: { test_copy?: boolean };
  try {
    const res = await fetch(new URL("/api/health", baseURL));
    health = await res.json();
  } catch {
    throw new Error(
      `Cannot reach the journal test copy at ${baseURL}.\n` +
        "Double-click start-test.bat in your trading-journal-propfirm folder, wait until it says\n" +
        '"TEST COPY of the Trading Journal is running at http://localhost:8001", then run the tests again.',
    );
  }

  if (health.test_copy !== true) {
    throw new Error(
      `STOP: ${baseURL} is not the journal TEST COPY (it does not report test_copy: true).\n` +
        "Close it and start the test copy with start-test.bat. Lessons never run against your real journal.",
    );
  }
}
