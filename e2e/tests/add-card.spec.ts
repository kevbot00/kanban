import { test, expect } from '@playwright/test';
import { resetTestDb } from '../support/db';

test.describe('Add Card', () => {
  test.beforeEach(async ({ page }) => {
    await resetTestDb();
    await page.goto('/');
  });

  test('should add a new card to the "To Do" column on blur', async ({
    page,
  }) => {
    const board = page.getByTestId('board');
    const todoColumn = board.getByTestId('column-list').first();
    await todoColumn.getByRole('button', { name: '+' }).click();
    await page.getByPlaceholder('Enter a title…').fill('New Card');
    await page.getByPlaceholder('Enter a title…').blur();
    await page.reload();
    await expect(todoColumn.getByTestId('card')).toHaveText([
      'Persist board to localStorage',
      'Write Playwright drag test',
      'Deploy to AWS',
      'New Card',
    ]);
  });

  test('should add a new card to the "To Do" column on Enter key press', async ({
    page,
  }) => {
    const board = page.getByTestId('board');
    const todoColumn = board.getByTestId('column-list').first();
    await todoColumn.getByRole('button', { name: '+' }).click();
    await page.getByPlaceholder('Enter a title…').fill('New Card');
    await page.getByPlaceholder('Enter a title…').press('Enter');
    await page.reload();
    await expect(todoColumn.getByTestId('card')).toHaveText([
      'Persist board to localStorage',
      'Write Playwright drag test',
      'Deploy to AWS',
      'New Card',
    ]);
  });

  test('should cancel adding a new card on Escape key press', async ({
    page,
  }) => {
    const board = page.getByTestId('board');
    const todoColumn = board.getByTestId('column-list').first();
    await todoColumn.getByRole('button', { name: '+' }).click();
    await page.getByPlaceholder('Enter a title…').fill('New Card');
    await page.getByPlaceholder('Enter a title…').press('Escape');

    await expect(page.getByPlaceholder('Enter a title…')).toBeHidden();
    await page.reload();

    await expect(todoColumn.getByTestId('card')).toHaveText([
      'Persist board to localStorage',
      'Write Playwright drag test',
      'Deploy to AWS',
    ]);
  });

  test('should cancel adding a new card on blur if the input is empty', async ({
    page,
  }) => {
    const board = page.getByTestId('board');
    const todoColumn = board.getByTestId('column-list').first();
    await todoColumn.getByRole('button', { name: '+' }).click();
    await page.getByPlaceholder('Enter a title…').blur();

    await expect(page.getByPlaceholder('Enter a title…')).toBeHidden();
    await page.reload();

    await expect(todoColumn.getByTestId('card')).toHaveText([
      'Persist board to localStorage',
      'Write Playwright drag test',
      'Deploy to AWS',
    ]);
  });
});
