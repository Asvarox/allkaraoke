import { expect, test } from '@playwright/test';

import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const gameCode = '12345';
const gameCodeIncorr = '123';

test('Should provide proper ux for manual connection', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.joinExistingGame();
  await pages.joinExistingGamePage.confirmWifiConnection();

  await test.step('Should focus on game code input when submitting without a code', async () => {
    await pages.joinExistingGamePage.connectWithGame();
    await expect(pages.joinExistingGamePage.gameCodeInput).toBeFocused();
  });

  await test.step('Should focus on game code input when it does not have the right length', async () => {
    await pages.joinExistingGamePage.gameCodeInput.fill(gameCodeIncorr);
    await pages.joinExistingGamePage.connectWithGame();
    await expect(pages.joinExistingGamePage.gameCodeInput).toBeFocused();
  });

  await test.step('Should attempt to connect automatically once a full code is entered', async () => {
    await pages.joinExistingGamePage.gameCodeInput.fill(gameCode);
    await expect(pages.joinExistingGamePage.connectButton).toBeDisabled();
  });
});
