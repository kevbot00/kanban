import { test, expect, type Page, type Request } from '@playwright/test';
import { resetTestDb } from '../support/db';

const todoCards = (page: Page) => {
  return page
    .getByTestId('board')
    .getByTestId('column-list')
    .first()
    .getByTestId('card');
};

const cardModal = (page: Page) => {
  return page.getByTestId('card-modal');
};

const cardModalDescriptionTextarea = (page: Page) => {
  return cardModal(page).getByTestId('card-modal-description-textarea');
};

const openCardModal = async (page: Page, cardIndex = 0) => {
  await todoCards(page).nth(cardIndex).click();
};

const watchCardSaveRequests = (page: Page) => {
  const requests: any[] = [];

  page.on('request', (req: Request) => {
    if (req.url().includes('/api/cards/') && req.method() === 'PATCH') {
      requests.push(req);
    }
  });
  return requests;
};

test.describe('Card modal', () => {
  test.beforeEach(async ({ page }) => {
    await resetTestDb();
    await page.goto('/');
  });

  test('opens when a card is clicked', async ({ page }) => {
    await openCardModal(page);
    await expect(page.getByTestId('card-modal')).toBeVisible();
  });

  test('closes when the close button is clicked', async ({ page }) => {
    await openCardModal(page);

    await expect(page.getByTestId('card-modal')).toBeVisible();

    const closeButton = page.getByTestId('card-modal-close-button');
    await closeButton.click();

    await expect(page.getByTestId('card-modal')).toBeHidden();
  });

  test('closes when the Escape key is pressed', async ({ page }) => {
    await openCardModal(page);

    await expect(page.getByTestId('card-modal')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByTestId('card-modal')).toBeHidden();
  });

  test('shows the correct card title and description', async ({ page }) => {
    await openCardModal(page);

    const cardModal = page.getByTestId('card-modal');
    await expect(cardModal.getByTestId('card-modal-title')).toHaveText(
      'Persist board to localStorage',
    );
    await expect(
      cardModal.getByTestId('card-modal-description-textarea'),
    ).toHaveValue('Persist the board state to localStorage so it is saved.');
  });

  test.describe('card description', () => {
    test('saves edits when the Save button is clicked', async ({ page }) => {
      await openCardModal(page);

      const cardModalEl = cardModal(page);
      const descriptionTextarea = cardModalDescriptionTextarea(page);

      await descriptionTextarea.click();
      await descriptionTextarea.fill('Updated description');
      await cardModalEl
        .getByTestId('card-modal-description-save-button')
        .click();

      await page.reload();
      await openCardModal(page);

      await expect(descriptionTextarea).toHaveValue('Updated description');
    });

    test('discards edits on cancel', async ({ page }) => {
      await openCardModal(page);

      const cardModalEl = cardModal(page);
      const descriptionTextarea = cardModalDescriptionTextarea(page);

      await descriptionTextarea.click();
      await descriptionTextarea.fill('Updated description');
      await cardModalEl
        .getByTestId('card-modal-description-cancel-button')
        .click();

      await page.reload();
      await openCardModal(page);

      await expect(descriptionTextarea).toHaveValue(
        'Persist the board state to localStorage so it is saved.',
      );
    });

    test('saves edits when clicking outside the field', async ({ page }) => {
      await openCardModal(page);

      const cardModalEl = cardModal(page);
      const descriptionTextarea = cardModalDescriptionTextarea(page);

      await descriptionTextarea.click();
      await descriptionTextarea.fill('Updated description');
      await descriptionTextarea.blur();
      await cardModalEl.getByTestId('card-modal-close-button').click();

      await page.reload();

      await openCardModal(page);
      await expect(descriptionTextarea).toHaveValue('Updated description');
    });

    test('does not save edits when the description is unchanged', async ({
      page,
    }) => {
      await openCardModal(page);

      const descriptionTextarea = cardModalDescriptionTextarea(page);

      const requests = watchCardSaveRequests(page);

      await descriptionTextarea.click();
      await descriptionTextarea.blur();
      await page.waitForTimeout(500);

      await page.reload();
      await openCardModal(page);

      await expect(descriptionTextarea).toHaveValue(
        'Persist the board state to localStorage so it is saved.',
      );

      expect(requests).toHaveLength(0);
    });

    test('does not save edits when the description is empty and unchanged', async ({
      page,
    }) => {
      await openCardModal(page, 1);

      const descriptionTextarea = cardModalDescriptionTextarea(page);
      const requests = watchCardSaveRequests(page);

      await expect(descriptionTextarea).toHaveValue('');
      await descriptionTextarea.click();
      await descriptionTextarea.blur();
      await page.waitForTimeout(500);

      await page.reload();
      await openCardModal(page, 1);

      await expect(descriptionTextarea).toHaveValue('');
      expect(requests).toHaveLength(0);
    });
  });
});
