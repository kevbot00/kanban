import { test, expect } from '@playwright/test';
import { SEEDED_BOARD_ID } from '../support/config';

test.describe('Move Card', () => {
  test('reorders a card within a column', async ({ page }) => {});
  test('moves a card to another column', async ({ page }) => {});
  test('moves a card into an empty column', async ({ page }) => {});
  test('reverts the card when the server rejects the move', async ({ page }) => {});
});
