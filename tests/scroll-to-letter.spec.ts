import { test } from '@playwright/test';

import initialise from './PageObjects/initialise';
import { initTestMode, mockRandom, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
  await mockRandom({ page, context }, 0);
});

const groupName = 'Z';

test('Scrolling to letter works', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.skipToMainMenu();
  await pages.mainMenuPage.goToSingSong();
  await pages.songLanguagesPage.continueAndGoToSongList();
  await pages.songListPage.goToGroupNavigation(groupName);
  await pages.songListPage.expectGroupToBeInViewport(groupName);
});
