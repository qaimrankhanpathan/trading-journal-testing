import type { FullConfig } from "@playwright/test";
import { assertTestCopyAddress, env } from "../../config/env";

/**
 * GLOBAL SETUP: runs once, before any test. A "pre-flight check" that fails fast with one clear message instead of
 * letting 40 tests fail one by one with confusing errors.
 *
 * It checks the two things every test depends on:
 *   1. the address is the test copy (never port 8000, never another computer);
 *   2. the journal there answers /api/health with "test_copy": true, which only start-test.bat switches on.
 */
export default async function globalSetup(_config: FullConfig): Promise<void> {
  assertTestCopyAddress(env.baseURL);

  let health: { ok?: boolean; test_copy?: boolean };
  try {
    const res = await fetch(new URL("/api/health", env.baseURL), { signal: AbortSignal.timeout(10_000) });
    health = (await res.json()) as typeof health;
  } catch {
    throw new Error(
      `Cannot reach the journal test copy at ${env.baseURL}.\n` +
        "Double-click start-test.bat in your trading-journal-propfirm folder and wait for\n" +
        '"TEST COPY of the Trading Journal is running at http://localhost:8001", then run the tests again.',
    );
  }

  if (health.test_copy !== true) {
    throw new Error(
      `STOP: ${env.baseURL} is not the journal TEST COPY (it does not report test_copy: true).\n` +
        "Close it and start the test copy with start-test.bat. The framework never runs against your real journal.",
    );
  }
}
