import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('Should provide proper ux for manual connection', async ({ browser, page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.joinExistingGame();
  await page.getByTestId('confirm-wifi-connection').click();

  await expect(page.getByTestId('game-code-input')).toBeFocused();

  await test.step('Should focus on game code input when not provided', async () => {
    await page.getByTestId('player-name-input').focus();
    await page.getByTestId('connect-button').click();
    await expect(page.getByTestId('game-code-input')).toBeFocused();
  });

  await test.step('Should focus on player name input when game code is provided but name is not', async () => {
    await page.getByTestId('game-code-input').fill('12345');
    await page.getByTestId('connect-button').click();
    await expect(page.getByTestId('player-name-input')).toBeFocused();
  });
  await test.step('Should focus on game code if it does not have the right length', async () => {
    await page.getByTestId('game-code-input').fill('123');
    await page.getByTestId('player-name-input').fill('test');
    await page.getByTestId('connect-button').click();
    await expect(page.getByTestId('game-code-input')).toBeFocused();
  });
});
