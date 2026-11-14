# Lesson 10: CI (continuous integration), for later

CI means a computer runs your tests automatically, for example on GitHub every time you press a button or push.
Your free GitHub Actions minutes are used up for now, so this lesson is **reading only**: the workflow is ready in
[`ci/playwright.yml`](../../ci/playwright.yml) but kept outside `.github/workflows`, so it never runs by itself.

## What the workflow does

1. Checks out these lessons, and the journal app (a private repo, so it needs a read-only token secret).
2. Installs Python and Node, builds the journal.
3. Starts a brand-new **empty** journal on port 8001 with `JOURNAL_TEST_COPY=1`. Your real data is never on
   GitHub's computer.
4. Installs Chromium and runs `--project=solutions`.
5. Uploads the HTML report (with traces of any failures) so you can open it from the run's page.

It starts only when you press **Run workflow** (`on: workflow_dispatch`), so it cannot use minutes by surprise.

## Turning it on later

1. Create a fine-grained token on GitHub (Settings > Developer settings > Personal access tokens > Fine-grained):
   repository access **only trading-journal-propfirm**, permission **Contents: Read-only**.
2. In this repo: Settings > Secrets and variables > Actions > **New repository secret**, name `JOURNAL_REPO_TOKEN`.
3. Copy `ci/playwright.yml` to `.github/workflows/playwright.yml`, commit and push.
4. Actions tab > *Playwright lessons* > **Run workflow**.

## Things that change in CI

- The journal there is empty. That is why every lesson makes its own data and never relies on your real accounts.
- No screen: tests run headless (no visible browser). Traces and the report are how you see what happened.
- `retries: 2` and `forbidOnly: !!process.env.CI` are common CI-only settings (try adding them to the config).

## Free alternative meanwhile

Run the whole suite locally before you push: `npm run typecheck && npm run solutions`. That is exactly what CI
would do.

## Final challenge

Write your own test for a journal feature you use every day (for example: a no-trade day on the Psychology page,
or a trade plan on the Trade plan page), with a page object, a fixture for its data and an API check. Then compare
with how the journal's own suite tests it in `frontend/e2e/suite`.
