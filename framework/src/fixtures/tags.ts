/**
 * TEST TAGS. One list, so nobody types "@smok" by mistake and silently leaves a test out of a run.
 *
 *   SMOKE       a few minutes at most: "is the app basically working?" Run before anything else.
 *   REGRESSION  the full check that nothing that used to work is broken. Run before you merge a change.
 *   API / UI / E2E  which layer the test goes through, so you can run one layer.
 *   FUNCTIONAL  checks one feature works as the user expects (tests/functional, see docs/TEST_PLAN.md).
 *   NEGATIVE    wrong input, cancelled actions, errors: the app must refuse safely and say why.
 *   A11Y        accessibility checks (axe-core).
 *
 *   npm run fw:smoke          only @smoke
 *   npx playwright test -c framework --grep "@api"
 *   npx playwright test -c framework --grep-invert "@a11y"
 */
export const TAG = {
  SMOKE: "@smoke",
  REGRESSION: "@regression",
  API: "@api",
  UI: "@ui",
  E2E: "@e2e",
  FUNCTIONAL: "@functional",
  NEGATIVE: "@negative",
  A11Y: "@a11y",
} as const;
