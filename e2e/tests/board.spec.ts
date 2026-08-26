import { test, expect } from '@playwright/test';

test.describe('Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the board columns in order', async ({ page }) => {
    const board = page.getByTestId('board');
    await expect(board.getByTestId('column-title')).toHaveText([
      'To Do',
      'In Progress',
      'Done',
    ]);
  });

  test("renders each column's cards in position order", async ({ page }) => {
    const board = page.getByTestId('board');
    const todoColumn = board.getByTestId('column-list').first();
    await expect(todoColumn.getByTestId('card')).toHaveText([
      'Persist board to localStorage',
      'Write Playwright drag test',
      'Deploy to AWS',
    ]);
    const inProgressColumn = board.getByTestId('column-list').nth(1);
    await expect(inProgressColumn.getByTestId('card')).toHaveText([
      'Build board, column, and card components',
      'Wire up dnd-kit sensors',
    ]);
    const doneColumn = board.getByTestId('column-list').nth(2);
    await expect(doneColumn.getByTestId('card')).toHaveText([
      'Scaffold Vite + React + TypeScript',
      'Add Tailwind',
    ]);
  });

  test('shows an empty column with no cards', async ({ page }) => {
    await page.route('**/api/boards/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'board-1',
          title: 'My Board',
          columns: [
            {
              id: 'column-1',
              title: 'To Do',
              cards: [],
            },
          ],
        }),
      });
    });
    await page.goto('/');
    const board = page.getByTestId('board');
    const todoColumn = board.getByTestId('column-list').first();
    await expect(todoColumn.getByTestId('card')).toHaveCount(0);
  });
});
