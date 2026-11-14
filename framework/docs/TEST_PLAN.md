# Functional test plan: Trading Journal

A test plan says **what** is tested, **why**, and **where** the test lives, so anyone can see what is covered
and what is not without reading code. Each case has an ID (`TC-ACC-03`) that is also in the test's title, so a
failure in the report points straight to a line in this plan.

## Scope

**Application under test:** the Trading Journal (trading-journal-propfirm), running as the **test copy** on
http://localhost:8001 (`start-test.bat`).

**In scope:** the features a trader uses every day: accounts, logging and editing trades, reviewing trades,
finding trades, the dashboard account book, the position size calculator, CSV import, navigation, display
preferences, and that every page opens without errors.

**Out of scope, and why:**

| Not tested                                               | Why                                                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| MT5 sync, MT5 import, live equity                        | needs MT5 and a trading account: never touched by these tests                       |
| Changing Settings (rules, journal start date, alarms)    | would change how the copy judges your real trades; the suite never changes settings |
| Trade plans, psychology, Labs, copier, business expenses | a larger second phase; they depend on today's date and on settings                  |
| Rule breaches and the alarm                              | needs judged trades, which needs settings changes (see above)                       |
| Visual design (colours, layout)                          | checked by eye; screenshots of failures are kept in the report                      |

## Approach

- **Page Object Model.** Every screen and component has a class in `src/pages`. Tests call user actions
  (`accountsPage.addAccount(...)`, `tradesPage.openTrade(row)`) and never use selectors themselves.
- **Set up through the API, test through the screen.** A test about the Trades page creates its account and trades
  with the `data` fixture (fast and reliable), then does the real steps on screen.
- **Check the screen and the stored data.** After a save, a test checks the screen AND reads the record back from
  the API: a form can look saved while the server stored something else.
- **Independent tests.** Each test makes its own uniquely named data and the fixture deletes it afterwards, so
  tests can run in any order and four at a time.
- **Safe data.** Names start `PW-FW-`; trades are dated 14 Oct 2026, before the journal start date, so they are
  "pre-journal": never judged by the rules and never trigger the alarm.

## Test cases

Tags: every case is `@functional @regression`; cases marked **N** are also `@negative` (wrong input, cancel,
errors).

### Accounts: `tests/functional/accounts.spec.ts`

| ID        | Case                                                                 |     |
| --------- | -------------------------------------------------------------------- | --- |
| TC-ACC-01 | The table shows an account's firm, phase, platform and start balance |     |
| TC-ACC-02 | The Trades column counts the account's trades                        |     |
| TC-ACC-03 | Add an account from the catalogue: the firm's rules are filled in    |     |
| TC-ACC-04 | The program list follows the chosen firm                             |     |
| TC-ACC-05 | Edit an account's profit target                                      |     |
| TC-ACC-06 | Cancel closes the form and saves nothing                             |     |
| TC-ACC-07 | Delete an account after confirming: it and its trades are gone       |     |
| TC-ACC-08 | Answering Cancel to the delete question keeps the account            | N   |
| TC-ACC-09 | Answering Cancel to "Add this as a main account?" saves nothing      | N   |
| TC-ACC-10 | A second account with the same name is refused with a message        | N   |
| TC-ACC-11 | "Other" platform without a name is refused with a message            | N   |

### Trades: log, edit, delete: `tests/functional/trades.spec.ts`

| ID        | Case                                                               |     |
| --------- | ------------------------------------------------------------------ | --- |
| TC-TRD-01 | Log a buy through the form: saved with the P&L worked out          |     |
| TC-TRD-02 | Log a sell: a fall in price is a profit                            |     |
| TC-TRD-03 | Fees are taken off the P&L                                         |     |
| TC-TRD-04 | A trade with no exit is saved as still open                        |     |
| TC-TRD-05 | Edit a trade's exit price: the P&L is worked out again             |     |
| TC-TRD-06 | Delete a trade after confirming                                    |     |
| TC-TRD-07 | Answering Cancel to the delete question keeps the trade            | N   |
| TC-TRD-08 | A close time before the open time shows an error and saves nothing | N   |
| TC-TRD-09 | An impossible lot size is refused with a message                   | N   |
| TC-TRD-10 | Missing lots keeps the form open and saves nothing                 | N   |
| TC-TRD-11 | Closing the form without saving saves nothing                      | N   |

### Trade review: `tests/functional/trade-review.spec.ts`

| ID        | Case                                                 |     |
| --------- | ---------------------------------------------------- | --- |
| TC-REV-01 | Clicking a trade opens its review panel              |     |
| TC-REV-02 | Grade, tag and write a lesson: all three are saved   |     |
| TC-REV-03 | Mark a trade reviewed: it is listed under "Reviewed" |     |
| TC-REV-04 | "Mark not reviewed" puts a reviewed trade back       |     |
| TC-REV-05 | An open trade cannot be marked reviewed yet          | N   |
| TC-REV-06 | The panel closes with its Close button               |     |

### Finding trades: `tests/functional/trade-filters.spec.ts`

| ID        | Case                                                  |     |
| --------- | ----------------------------------------------------- | --- |
| TC-FLT-01 | The account filter shows only that account's trades   |     |
| TC-FLT-02 | Search finds a trade by a word in its notes           |     |
| TC-FLT-03 | The side filter shows only buys or only sells         |     |
| TC-FLT-04 | Nothing matching shows the empty state and a way back | N   |
| TC-FLT-05 | Clear removes every filter                            |     |

### Dashboard: `tests/functional/dashboard.spec.ts`

| ID        | Case                                                                     |     |
| --------- | ------------------------------------------------------------------------ | --- |
| TC-DSH-01 | A new account is listed with its starting balance and full drawdown room |     |
| TC-DSH-02 | A winning trade raises the balance and the progress to target            |     |
| TC-DSH-03 | A losing trade lowers the balance and the drawdown room                  |     |
| TC-DSH-04 | The stage shows the account's phase                                      |     |
| TC-DSH-05 | A deleted account disappears from the dashboard                          |     |

### Position size calculator: `tests/functional/calculator.spec.ts`

| ID        | Case                                                                  |     |
| --------- | --------------------------------------------------------------------- | --- |
| TC-CAL-01 | A buy with a 10 pip stop risks more than $0 and at most 1% of $10,000 |     |
| TC-CAL-02 | A sell with its stop above the entry gets a size                      |     |
| TC-CAL-03 | A stop twice as far away gives about half the lots                    |     |
| TC-CAL-04 | A buy with its stop above or at the entry gives no size (2 cases)     | N   |

### CSV import: `tests/functional/import.spec.ts`

| ID        | Case                                                                                |     |
| --------- | ----------------------------------------------------------------------------------- | --- |
| TC-IMP-01 | A valid CSV imports its trades into the chosen account (with the firm's commission) |     |
| TC-IMP-02 | A file without the required columns shows an error and imports nothing              | N   |

### Navigation: `tests/functional/navigation.spec.ts`

| ID        | Case                                                                     |     |
| --------- | ------------------------------------------------------------------------ | --- |
| TC-NAV-01 | The side menu opens a main page                                          |     |
| TC-NAV-02 | "More pages" opens a page that is not in the trading-day list            |     |
| TC-NAV-03 | A section tab opens a page inside its group (Trade plan > Position size) |     |
| TC-NAV-04 | Back returns to the page you came from                                   |     |

### Display preferences: `tests/functional/preferences.spec.ts`

| ID        | Case                                                                |     |
| --------- | ------------------------------------------------------------------- | --- |
| TC-PRF-01 | The theme button switches between light and dark                    |     |
| TC-PRF-02 | The chosen theme is remembered after a reload                       |     |
| TC-PRF-03 | Larger text zooms the page; the reset button brings it back to 100% |     |
| TC-PRF-04 | The chosen text size is remembered after a reload                   |     |

### Page health: `tests/functional/page-health.spec.ts`

| ID       | Case                                                                                     |     |
| -------- | ---------------------------------------------------------------------------------------- | --- |
| TC-PG-01 | Each of the 29 pages opens with its heading and no JavaScript errors (one test per page) |     |
| TC-PG-02 | An address that does not exist answers 404, not a crash                                  | N   |

**Total: 54 cases, 83 tests (some cases run once per page or per input).**

## Findings

Things the suite found about the journal while it was being built. Each one is either worked around in a page
object (with a comment saying why) or reflected in the expected values.

| #   | Finding                                                                                                                                                                             | Effect                                                                                                                                               | Where handled                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| F1  | The Trades page does not ignore an older list answer that arrives late. Two quick filter changes (or fast typing in Search) can leave the list of the **earlier** filter on screen. | Probably a real bug: a trader typing fast in Search could see the wrong trades. Worth fixing in the journal (ignore answers to an outdated request). | `FilterBar` waits for each answer before the next change |
| F2  | The new-account form can be filled before the firm catalogue has loaded. Choosing a firm then keeps the previous firm's program, and "Account size" never appears.                  | Rare for a person, easy for a fast click.                                                                                                            | `AccountForm.waitForCatalogue()`                         |
| F3  | The database gives a deleted account's id to the next new account.                                                                                                                  | Tests and clean-up identify data by unique name, never by a remembered id.                                                                           | `DataFactory.cleanUp()`, API tests                       |
| F4  | A CSV without a fees column is charged the firm's commission (FundingPips: $5 per lot on forex).                                                                                    | Expected behaviour, now documented by TC-IMP-01.                                                                                                     | `import.spec.ts`                                         |
| F5  | "To review" only lists trades the journal judges, so pre-journal practice trades never appear there.                                                                                | Expected behaviour.                                                                                                                                  | TC-REV-03 checks the "Reviewed" list instead             |

## Entry and exit criteria

- **Start:** the test copy is running (`start-test.bat`), and `npm run check` passes.
- **Done:** every test passes, and a repeat run (`--repeat-each=5 --workers=4`) has no failures. Any failure is
  either a journal bug (write it in Findings) or a test bug (fix the page object or test).

## How to run

```bat
npx playwright test -c framework --grep @functional           all functional tests
npx playwright test -c framework --grep @negative             only the negative cases
npx playwright test -c framework -g "TC-ACC"                  one feature
npx playwright test -c framework -g "TC-TRD-05"               one case
```
