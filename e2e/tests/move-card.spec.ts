import { test, expect, type Page, type Locator } from '@playwright/test';
import { resetTestDb } from '../support/db';

const dragCard = async (page: Page, card: Locator, target: Locator) => {
  const from = await card.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) {
    throw new Error('Could not get bounding boxes for drag and drop');
  }

  const startX = from.x + from.width / 2;
  const startY = from.y + from.height / 2;
  const endX = to.x + to.width / 2;
  const endY = to.y + to.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX, startY + 10, { steps: 5 });
  await page.mouse.move(endX, endY, { steps: 20 });
  await page.mouse.move(endX, endY);
  await page.mouse.up();
};

const dragCardAndWaitForResponse = async (
  page: Page,
  card: Locator,
  target: Locator,
  method: 'POST' | 'PATCH' = 'POST',
) => {
  const [response] = await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/cards/') && response.request().method() === method),
    dragCard(page, card, target),
  ]);
  return response;
};

test.describe('Move Card', () => {
  test.beforeEach(async ({ page }) => {
    await resetTestDb();
    await page.goto('/');
  });

  test('reorders a card within a column', async ({ page }) => {
    const board = page.getByTestId('board');
    const todoColumn = board.getByTestId('column-list').first();

    const response = await dragCardAndWaitForResponse(
      page,
      todoColumn.getByTestId('card').first(),
      todoColumn.getByTestId('card').nth(1),
    );

    expect(response.status()).toBe(200);
    await expect(todoColumn.getByTestId('card')).toHaveText([
      'Write Playwright drag test',
      'Persist board to localStorage',
      'Deploy to AWS',
    ]);
  });

  test('moves a card to another column', async ({ page }) => {
    const board = page.getByTestId('board');
    const todoColumn = board.getByTestId('column-list').first();
    const inProgressColumn = board.getByTestId('column-list').nth(1);

    const response = await dragCardAndWaitForResponse(
      page,
      todoColumn.getByTestId('card').first(),
      inProgressColumn,
    );
    expect(response.status()).toBe(200);

    await expect(inProgressColumn.getByTestId('card')).toHaveText([
      'Persist board to localStorage',
      'Build board, column, and card components',
      'Wire up dnd-kit sensors',
    ]);
    await expect(todoColumn.getByTestId('card')).toHaveText([
      'Write Playwright drag test',
      'Deploy to AWS',
    ]);
  });

  test('moves a card into an empty column', async ({ page }) => {
    const board = page.getByTestId('board');
    const todoColumn = board.getByTestId('column-list').first();
    const backlogColumn = board.getByTestId('column-list').nth(3);

    await expect(backlogColumn.getByTestId('card')).toHaveCount(0);

    const response = await dragCardAndWaitForResponse(
      page,
      todoColumn.getByTestId('card').first(),
      backlogColumn,
    );
    expect(response.status()).toBe(200);

    await expect(backlogColumn.getByTestId('card')).toHaveText([
      'Persist board to localStorage',
    ]);
    await expect(todoColumn.getByTestId('card')).toHaveText([
      'Write Playwright drag test',
      'Deploy to AWS',
    ]);
  });

  test('reverts the card when the server rejects the move', async ({
    page,
  }) => {
    const board = page.getByTestId('board');
    const todoColumn = board.getByTestId('column-list').first();
    const inProgressColumn = board.getByTestId('column-list').nth(1);

    await page.route('**/api/cards/**', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      }),
    );

    const response = await dragCardAndWaitForResponse(
      page,
      todoColumn.getByTestId('card').first(),
      inProgressColumn,
    );
    expect(response.status()).toBe(500);

    await expect(todoColumn.getByTestId('card')).toHaveText([
      'Persist board to localStorage',
      'Write Playwright drag test',
      'Deploy to AWS',
    ]);
    await expect(inProgressColumn.getByTestId('card')).toHaveText([
      'Build board, column, and card components',
      'Wire up dnd-kit sensors',
    ]);
  });
});
