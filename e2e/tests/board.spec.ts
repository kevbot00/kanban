import { test, expect } from '@playwright/test';

test.describe('Board', () => {
  test('renders the board columns in order', async ({ page }) => {
    console.log('running test');
    await page.goto('/');
    const board = page.getByRole('region', { name: 'Board' });
    await expect(board.getByRole('heading', { level: 2 })).toHaveText([
      'To Do',
      'In Progress',
      'Done',
    ]);
  });
  test("renders each column's cards in position order", async ({ page }) => {});
  // test('shows an error when the board fails to load', async ({ page }) => {})
  test('shows an empty column with no cards', async ({ page }) => {});
});
