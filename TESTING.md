# Testing

The app is covered by two end-to-end suites, both run on every push and pull request in GitHub Actions:

- a TypeScript Playwright suite in `e2e/`, with 20 browser tests across four specs, each run in Chromium, Firefox and WebKit
- a Python suite in `e2e-py/`, with 27 API tests (pytest and httpx), 6 browser tests in pytest-playwright and 4 in Selenium WebDriver, each browser layer with its own page object, reported through Allure

This document covers how the suites are isolated, the rules the assertions follow, the flaky and weak tests that were found and how they were fixed, and what is deliberately not covered yet.

## Coverage

### TypeScript (`e2e/`)

| Spec                 | What it covers                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `board.spec.ts`      | Columns and cards render in position order; an empty column renders with no cards               |
| `add-card.spec.ts`   | Creating a card on blur and on Enter; cancelling on Escape and on an empty blur                  |
| `card-modal.spec.ts` | Opening and closing the modal; saving, cancelling, and skipping unchanged description edits      |
| `move-card.spec.ts`  | Reordering within a column, moving across columns, dropping into an empty column, and rolling back when the server rejects a move |

### Python (`e2e-py/`)

| File                        | What it covers                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| `tests/api/test_boards.py`  | The seeded board matches hand-written expectations; 404 for an unknown board; 400 for a malformed id |
| `tests/api/test_cards.py`   | Create validation, 404s, client-supplied and duplicate ids; PATCH updates and whitelist stripping; moves to the top, middle and end, past the end, into an empty column, across boards, and with a negative index; malformed ids on every card endpoint |
| `tests/ui/test_add_card.py` | Creating a card on Enter; cancelling on Escape sends no request                                  |
| `tests/ui/test_move_card.py` | Reordering, moving across columns, dropping into an empty column, and rolling back on a 500, each checked in the UI and through the API |
| `tests/selenium/test_board_selenium.py` | The same board through Selenium WebDriver: render order, adding a card, opening the card modal, and a cross-column drag |

### Selenium

Selenium can't wait on a network response the way Playwright's `expect_response` does, so the Selenium tests wait on conditions instead. `WebDriverWait` polls the API until the change has persisted, then polls the DOM until it matches, so neither side relies on a fixed sleep. The drag has the same problem as `dragTo` in Playwright: dnd-kit drops nothing if press, move and release arrive at once. `ActionChains` moves in 20 steps with short pauses between them so dnd-kit's `requestAnimationFrame` loop sees the drag.

### Allure report

The Python suite writes Allure results on every run. Tests are grouped by layer (API, Playwright, Selenium) and feature, and the API card tests also by story. Page object and API client methods are Allure steps, so a failing test shows which action broke. Every non-GET API call attaches its request and response bodies, and failing browser tests attach a screenshot. CI builds the report with Allure 3 and uploads it as the `allure-report` artifact.

## Isolation

Every run gets a known starting state and never touches development data.

- **Separate database.** Docker provisions a `kanban_test` database next to the development one. Playwright starts its own API (port 3001) and web server (port 5174) pointed at it, so `npm run dev` on 3000/5173 can keep running during a test run.
- **Reset before every test.** `globalSetup` applies migrations once, then each test's `beforeEach` deletes the board and re-seeds it. The reset runs in-process through a `PrismaClient` instead of shelling out to the Prisma CLI, which took it from about 1.5s to about 20ms per test.
- **One seed definition.** The seed script and both suites' resets build the board from `api/prisma/seed-data.json`. The tests write their expected values out by hand rather than importing them, so a wrong seed fails the tests instead of silently agreeing with them.
- **Serial by design.** `workers: 1`. Every test resets the same database, so parallel workers wipe each other's data mid-test. This showed up as `boards_pkey` unique violations and failures that moved between runs.

### Python suite

- **Its own database and ports.** The Python suite uses `kanban_test_py` with the API on 3002 and the web app on 5175, so it can run alongside the TypeScript suite without either resetting the other's data. It refuses `pytest -n` for the same reason the TypeScript suite runs with `workers: 1`.
- **SQL reset.** Python can't import the Prisma client, so `support/db.py` deletes the board and rebuilds it from `seed-data.json` with psycopg in one transaction. Prisma fills in ids and `updatedAt` on the client, so the reset supplies them. That makes it a second write path for the same data, and `test_seeded_board_matches_the_expected_state` exists to catch the two drifting apart.
- **Servers are started by a session fixture.** pytest has no equivalent of Playwright's `webServer`, so `support/servers.py` runs migrations, then starts the API and Vite and waits on their health checks. Locally it reuses servers that are already up; in CI it always starts its own. If one server fails to start, the other is shut down rather than left running for the next run to reuse.

## Assertion rules

- **Assert the server, not just the UI.** Creates, edits, and moves update the UI optimistically, so a UI-only assertion passes even if the backend rejects every request. Tests that change data wait for the matching response and assert its status. The wait matches on URL and method only; the status is checked afterwards, because a predicate that requires `200` can never observe the failure the rollback test exists to trigger.
- **Assert whole lists.** Columns are checked with `toHaveText([...])` against every card in order. That catches wrong order, wrong count, and duplicates in one assertion. Checking only `nth(1)` passed even while the DOM briefly held a duplicated card mid-drag.
- **Check both ends of a move.** Cross-column tests assert the source column lost the card as well as the destination gaining it, so a copy-instead-of-move bug fails.
- **Negative paths assert that nothing was sent.** Cancel and unchanged-edit tests record outgoing requests and assert none were made. A reload alone can't prove that, because the reload itself can cancel a stray request before it lands.
- **Failure paths are stubbed.** `page.route` returns a 500 for the rollback test and a stubbed board for the empty-state render.
- **Waits are on conditions.** Tests wait for a response, a visible element, or a retrying assertion. The one exception is the two unchanged-edit tests in `card-modal.spec.ts`, which pause 500ms so that a stray save request would have time to fire before they assert none did. Replacing that pause with a condition is listed under known gaps.

### Drag and drop

`locator.dragTo()` does not work with dnd-kit. Its pointer sensor processes movement through `requestAnimationFrame`, and `dragTo` sends press, move, and release before a single frame runs, so dnd-kit sees a drag that starts and ends in place and drops nothing. The suite drives the mouse along an explicit path with intermediate `steps` instead, then waits two animation frames before releasing so dnd-kit has handled the final position. WebKit needs that wait because it runs very few frames during synthetic mouse moves.

## Flaky tests fixed at the root cause

None of these were fixed with retries or sleeps.

| Symptom | Root cause | Fix |
| ------- | ---------- | --- |
| Unique-key violations; failures moving between runs | Spec files ran in parallel against one database | `workers: 1` |
| Intermittent wrong starting state | `resetTestDb()` was not awaited and raced `page.goto` | Awaited the reset |
| Server logged Prisma `P2025` in about one run in three | A move request was still in flight when the next test's reset deleted the card | Wait for the move response before the test ends |
| New card sometimes missing after reload | The reload cancelled the in-flight create request | Wait for the create response before reloading. Reproduced deterministically by delaying the request 300ms; failed before the fix, passes after |
| WebKit drags dropped the card back where it started (8 of 20 WebKit runs) | WebKit ran about 2 animation frames across a whole synthetic drag, so dnd-kit hadn't processed the final pointer position at release | Wait two animation frames before `mouse.up()` |
| Empty-column test showed the seeded cards (2 of 5 Firefox runs, 1 of 5 WebKit) | The board stub was registered after `beforeEach` had already loaded the page, racing the board request | Register the route, then load the page |

## Weak tests found and fixed

These passed while not proving what they claimed. Several were found by deliberately breaking the behavior and checking whether the test noticed.

- **Add-card passed while the feature was broken.** It asserted only the seeded cards, and a retrying assertion is satisfied by the state before the action happens. It now asserts the full list including the new card.
- **The rollback test passed with no drag at all.** With the drag removed it still went green, because the card starting in place looks the same as a card that moved and rolled back. It now waits for the rejected `500` response, so no drag means no request and a failure.
- **The "empty column" test used a column with two cards.** The seed had no empty column. An empty column was added, which matters because empty-column drops were a real bug.
- **Cancel tests couldn't detect a stray create.** Verified by injecting a create request into the Escape path: every existing assertion still passed, and only the new zero-requests check failed.

## Bugs found by the API tests

| Bug | Cause | Fix |
| --- | ----- | --- |
| Creating a card with an existing id returned 500 | The unique-key violation (Prisma `P2002`) was never caught | `CardsService.create` maps `P2002` to a 409 Conflict |
| Moving a card to an index past the end of a column put it at the top, in an order that changed between runs | With both neighbours undefined, the move took the empty-column branch and set `position = 1000`, tying with the first card, which was then ordered by random id | The index is clamped to the number of other cards in the column |

## Known gaps

- **Two fixed 500ms waits** in the unchanged-edit tests, described under assertion rules.
- **No unit tests.** The fractional position math in `CardsService.move` is covered only through the API and the UI.
- **Keyboard dragging** through dnd-kit's keyboard sensor is untested.
- **No accessibility or visual regression checks.**

## Running

```bash
npm run test:e2e        # headless
npm run test:e2e:ui     # Playwright UI mode
```

Run from the repo root. The suite runs in Chromium, Firefox, and WebKit with no retries. In CI, Postgres runs as a service container, traces are kept for failing tests, and the HTML report is uploaded as an artifact.

For the Python suite, set up once from `e2e-py/`:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
```

If your Postgres volume predates `kanban_test_py`, create the database once with `docker exec kanban-postgres createdb -U kanban kanban_test_py`. Then run:

```bash
.venv/bin/pytest -v
```

To browse the Allure report from the last run:

```bash
npx allure@3.33.0 open allure-results
```

In CI it runs as a separate job with its own Postgres container, retries nothing, and uploads a JUnit report, Playwright traces for failed tests, and the Allure report.
