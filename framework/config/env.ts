import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * ENVIRONMENT CONFIG: the one place that reads settings from outside the code.
 *
 * Professional suites never hard-code addresses, browsers or timeouts inside tests. They read them here, check them
 * once, and give every other file a typed, already-checked `env` object. Change a value with a `.env` file
 * (copy .env.example) or for one run on the command line:   set WORKERS=1 && npm run fw:test
 *
 * SAFETY: this file refuses to load unless the address is the journal TEST COPY on your own PC (port 8001).
 */

// Node 24 can read a .env file by itself, so no extra package is needed.
const envFile = join(__dirname, "..", ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

const REAL_JOURNAL_PORT = "8000";
const LOCAL_HOSTS = ["localhost", "127.0.0.1"];

function text(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

function whole(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) throw new Error(`${name} must be a whole number, got "${raw}"`);
  return value;
}

function yesNo(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  return ["1", "true", "yes", "on"].includes(raw);
}

/** Throws unless the address is the test copy on this PC. Checked here AND again in safety/global-setup.ts. */
export function assertTestCopyAddress(baseURL: string): void {
  const url = new URL(baseURL);
  if (url.port === REAL_JOURNAL_PORT) {
    throw new Error(`STOP: ${baseURL} is your REAL journal (port 8000). The framework only runs against the test copy on port 8001.`);
  }
  if (!LOCAL_HOSTS.includes(url.hostname)) {
    throw new Error(`STOP: ${baseURL} is not on this PC. The framework only runs against the local test copy.`);
  }
}

const isCI = yesNo("CI", false);
const defaultChannel = process.platform === "win32" ? "msedge" : "chromium";

export const env = {
  /** The journal test copy. Started by start-test.bat in trading-journal-propfirm. */
  baseURL: text("BASE_URL", "http://localhost:8001"),
  /** "msedge" (Windows default, already installed), "chrome", or "chromium" (Playwright's own browser). */
  channel: text("BROWSER_CHANNEL", defaultChannel),
  /** false opens a visible browser window, handy while writing a test. */
  headless: yesNo("HEADLESS", true),
  /** How many tests run at the same time. Every test makes its own data, so they do not get in each other's way. */
  workers: whole("WORKERS", 2),
  /** Re-run a failed test this many times. 0 locally (see failures straight away), 2 on a CI server. */
  retries: whole("RETRIES", isCI ? 2 : 0),
  /** Slow every browser action down by this many milliseconds, to watch what a test does. */
  slowMo: whole("SLOW_MO", 0),
  isCI,
} as const;

assertTestCopyAddress(env.baseURL);

export type Env = typeof env;
