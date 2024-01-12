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
  await pages.inputSelectionPage.skipToMainMenu();
  await pages.mainMenuPage.expectFullscreenToBeOff();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await pages.songListPage.expectFullscreenToBeOn();
  await page.keyboard.press('Backspace');
  await pages.mainMenuPage.toggleFullscreen();
  await pages.mainMenuPage.expectFullscreenToBeOff();
  await pages.mainMenuPage.goToSingSong();
  await pages.songListPage.expectFullscreenToBeOff();
});
