import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const gameCode = '12345';
const gameCodeIncorr = '123';
const playerName = 'test';

test('Should provide proper ux for manual connection', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.joinExistingGame();
  await pages.joinExistingGamePage.confirmWifiConnection();

  await test.step('Should focus on game code input when not provided', async () => {
    await pages.joinExistingGamePage.gameCodeInput.focus();
    await pages.joinExistingGamePage.playerNameInput.focus();
    await pages.joinExistingGamePage.connectWithGame();
    await expect(pages.joinExistingGamePage.gameCodeInput).toBeFocused();
    await expect(pages.joinExistingGamePage.playerNameInput).toBeEmpty();
  });

  await test.step('Should focus on player name input when game code is provided but name is not', async () => {
    await pages.joinExistingGamePage.gameCodeInput.fill(gameCode);
    await pages.joinExistingGamePage.connectWithGame();
    await expect(pages.joinExistingGamePage.playerNameInput).toBeFocused();
  });

  await test.step('Should focus on game code if it does not have the right length', async () => {
    await pages.joinExistingGamePage.gameCodeInput.fill(gameCodeIncorr);
    await pages.joinExistingGamePage.playerNameInput.fill(playerName);
    await pages.joinExistingGamePage.connectWithGame();
    await expect(pages.joinExistingGamePage.gameCodeInput).toBeFocused();
  });
});
