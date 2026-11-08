# Testing

The app is covered by a Playwright end-to-end suite: 20 tests across four specs, run on every push and pull request in GitHub Actions. This document covers how the suite is isolated, the rules the assertions follow, the flaky and weak tests that were found and how they were fixed, and what is deliberately not covered yet.

## Coverage

| Spec                 | What it covers                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `board.spec.ts`      | Columns and cards render in position order; an empty column renders with no cards               |
| `add-card.spec.ts`   | Creating a card on blur and on Enter; cancelling on Escape and on an empty blur                  |
| `card-modal.spec.ts` | Opening and closing the modal; saving, cancelling, and skipping unchanged description edits      |
| `move-card.spec.ts`  | Reordering within a column, moving across columns, dropping into an empty column, and rolling back when the server rejects a move |

## Isolation

Every run gets a known starting state and never touches development data.

- **Separate database.** Docker provisions a `kanban_test` database next to the development one. Playwright starts its own API (port 3001) and web server (port 5174) pointed at it, so `npm run dev` on 3000/5173 can keep running during a test run.
- **Reset before every test.** `globalSetup` applies migrations once, then each test's `beforeEach` deletes the board and re-seeds it. The reset runs in-process through a `PrismaClient` instead of shelling out to the Prisma CLI, which took it from about 1.5s to about 20ms per test.
- **One seed definition.** The seed script and the reset both build the board from `api/prisma/seed-data.ts`. The tests write their expected values out by hand rather than importing them, so a wrong seed fails the tests instead of silently agreeing with them.
- **Serial by design.** `workers: 1`. Every test resets the same database, so parallel workers wipe each other's data mid-test. This showed up as `boards_pkey` unique violations and failures that moved between runs.

## Assertion rules

- **Assert the server, not just the UI.** Creates, edits, and moves update the UI optimistically, so a UI-only assertion passes even if the backend rejects every request. Tests that change data wait for the matching response and assert its status. The wait matches on URL and method only; the status is checked afterwards, because a predicate that requires `200` can never observe the failure the rollback test exists to trigger.
- **Assert whole lists.** Columns are checked with `toHaveText([...])` against every card in order. That catches wrong order, wrong count, and duplicates in one assertion. Checking only `nth(1)` passed even while the DOM briefly held a duplicated card mid-drag.
- **Check both ends of a move.** Cross-column tests assert the source column lost the card as well as the destination gaining it, so a copy-instead-of-move bug fails.
- **Negative paths assert that nothing was sent.** Cancel and unchanged-edit tests record outgoing requests and assert none were made. A reload alone can't prove that, because the reload itself can cancel a stray request before it lands.
- **Failure paths are stubbed.** `page.route` returns a 500 for the rollback test and a stubbed board for the empty-state render.
- **Waits are on conditions.** Tests wait for a response, a visible element, or a retrying assertion. The one exception is the two unchanged-edit tests in `card-modal.spec.ts`, which pause 500ms so that a stray save request would have time to fire before they assert none did. Replacing that pause with a condition is listed under known gaps.

### Drag and drop

`locator.dragTo()` does not work with dnd-kit. Its pointer sensor processes movement through `requestAnimationFrame`, and `dragTo` sends press, move, and release before a single frame runs, so dnd-kit sees a drag that starts and ends in place and drops nothing. The suite drives the mouse along an explicit path with intermediate `steps` instead.

## Flaky tests fixed at the root cause

None of these were fixed with retries or sleeps.

| Symptom | Root cause | Fix |
| ------- | ---------- | --- |
| Unique-key violations; failures moving between runs | Spec files ran in parallel against one database | `workers: 1` |
| Intermittent wrong starting state | `resetTestDb()` was not awaited and raced `page.goto` | Awaited the reset |
| Server logged Prisma `P2025` in about one run in three | A move request was still in flight when the next test's reset deleted the card | Wait for the move response before the test ends |
| New card sometimes missing after reload | The reload cancelled the in-flight create request | Wait for the create response before reloading. Reproduced deterministically by delaying the request 300ms; failed before the fix, passes after |

## Weak tests found and fixed

These passed while not proving what they claimed. Several were found by deliberately breaking the behavior and checking whether the test noticed.

- **Add-card passed while the feature was broken.** It asserted only the seeded cards, and a retrying assertion is satisfied by the state before the action happens. It now asserts the full list including the new card.
- **The rollback test passed with no drag at all.** With the drag removed it still went green, because the card starting in place looks the same as a card that moved and rolled back. It now waits for the rejected `500` response, so no drag means no request and a failure.
- **The "empty column" test used a column with two cards.** The seed had no empty column. An empty column was added, which matters because empty-column drops were a real bug.
- **Cancel tests couldn't detect a stray create.** Verified by injecting a create request into the Escape path: every existing assertion still passed, and only the new zero-requests check failed.

## Known gaps

- **Chromium only.** Firefox and WebKit are not run yet.
- **Two fixed 500ms waits** in the unchanged-edit tests, described under assertion rules.
- **No API-level tests.** Validation, 404s, and cross-board move rejection are only exercised through the UI. Request-level specs using Playwright's `request` fixture are planned.
- **No unit tests.** The fractional position math in `CardsService.move` is covered only end to end.
- **Keyboard dragging** through dnd-kit's keyboard sensor is untested.
- **No accessibility or visual regression checks.**

## Running

```bash
npm run test:e2e        # headless
npm run test:e2e:ui     # Playwright UI mode
```

Run from the repo root. In CI, Postgres runs as a service container, traces are recorded on the first retry, and the HTML report is uploaded as an artifact.
