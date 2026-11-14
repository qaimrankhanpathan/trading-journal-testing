# Lesson 8: Debugging

Tests fail. The skill is finding out *why* quickly. Playwright has excellent tools for that.

## 1. Read the error

The terminal shows the failed check, what it expected, what it got, and the line. Often that is enough:

```
Expected substring: "10000"
Received string:    "PW-Account-...FundingPipsPhase 1MT5$10,000.008%..."
```

## 2. UI mode: `npm run ui`

The best place to learn and debug. Pick a test, press play, then click any step on the left to see the page
**at that moment** (before and after), the locator it used, console and network. **Pick locator** helps you write
new ones. Tick **watch** (the eye) and the test reruns every time you save the file.

## 3. Trace viewer: the recording of a failure

`playwright.config.ts` has `trace: "retain-on-failure"`: every failed test leaves a `trace.zip` recording.

```bat
npm run report
```

Click the failed test, then **Trace**. Or open one directly:
`npx playwright show-trace test-results\<folder>\trace.zip`. It is the same view as UI mode, for a test that
already ran (great for failures on another computer or in CI).

## 4. Step through live: `--debug`

```bat
npx playwright test lessons/08 --project=exercises --debug
```

The browser opens and pauses before the first action. Use **Step over** to go one action at a time. Put
`await page.pause();` anywhere in a test to stop exactly there.

## 5. Make failures easier to read

- `await test.step("open the Accounts page", async () => { ... })`: named steps in the report and trace.
- `testInfo.attach(...)`: add screenshots or notes to the report.
- Listen to `page.on("pageerror")` and `page.on("console")`: a JavaScript crash is a bug even when the screen looks OK.

## Exercise

`exercise.spec.ts` contains a test with **three bugs**. Find each with the trace viewer or `--debug`, not by
guessing. The solution file explains all three.
