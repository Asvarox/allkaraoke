import { test } from '@playwright/test';

import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('Fullscreen is turning on automatically, if user doesnt turn off fullscreen before', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Fullscreen is disabled by default', async () => {
    await pages.inputSelectionPage.skipToMainMenu();
    await pages.mainMenuPage.expectFullscreenToBeOff();
  });

  await test.step('Fullscreen is enabled by default on the song list page', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.expectFullscreenToBeOn();
  });

  await test.step('Turning off fullscreen makes that mode is not getting on automatically', async () => {
    await page.keyboard.press('Backspace');
    await pages.mainMenuPage.toggleFullscreen();
    await pages.mainMenuPage.expectFullscreenToBeOff();
    await pages.mainMenuPage.goToSingSong();
    await pages.songListPage.expectFullscreenToBeOff();
  });
});
