import { test, expect, TAG } from "@fixtures";

test.describe("Health check", { tag: [TAG.API, TAG.SMOKE] }, () => {
  test("the journal is up and is the test copy", async ({ api }) => {
    const health = await api.health.get();

    expect(health.ok).toBe(true);
    expect(health.test_copy).toBe(true);
    expect(health.schema_version).toBeGreaterThan(0);
  });
});
