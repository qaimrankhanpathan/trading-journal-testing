// LINTING: ESLint reads the code without running it and flags mistakes and risky habits.
// Run `npm run lint` (or `npm run lint:fix` to fix what it can). It checks the framework/ folder only;
// the lessons are left as they are, so your exercise files are never reformatted under you.
import js from "@eslint/js";
import playwright from "eslint-plugin-playwright";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules/", "lessons/", "support/", "playwright.config.ts", "framework/reports/", "**/*.js", "**/*.mjs"] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { project: "./framework/tsconfig.json", tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // A missing `await` is the most common Playwright bug: the test moves on before the click happened.
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      // `_config` style arguments are allowed to be unused.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // Playwright's own rules, for the test files: no page.waitForTimeout, no test.only left behind,
    // no expect() hidden inside an if, use web-first assertions (expect(locator).toBeVisible()), and more.
    files: ["framework/tests/**/*.ts"],
    ...playwright.configs["flat/recommended"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      "playwright/no-focused-test": "error",
      "playwright/no-wait-for-timeout": "error",
      "playwright/no-networkidle": "error",
      "playwright/prefer-web-first-assertions": "error",
      "playwright/expect-expect": ["error", { assertFunctionNames: ["expect"] }],
      // Tags come from the TAG list in src/fixtures/tags.ts, which this rule cannot read: TypeScript checks them instead.
      "playwright/valid-test-tags": "off",
    },
  },
);
