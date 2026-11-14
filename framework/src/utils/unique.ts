let counter = 0;

/**
 * A name no other test (or earlier run) has used, e.g. "PW-FW-Account-mhx2k1-w0-3".
 * Every name starts with "PW-" so practice data is easy to spot, and it includes the worker number, so tests that
 * run at the same time never pick the same name.
 */
export function uniqueName(prefix: string): string {
  const worker = process.env.TEST_PARALLEL_INDEX ?? "0";
  return `PW-FW-${prefix}-${Date.now().toString(36)}-w${worker}-${++counter}`;
}
