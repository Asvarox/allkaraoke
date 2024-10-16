import { expect, test } from '@playwright/test';

import initialise from './PageObjects/initialise';
import { initTestMode, mockRandom, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
  await mockRandom({ page, context }, 0);
});

const language = 'English';
const groupName = 'Z';

test('Scrolling to letter works', async ({ page }) => {
  await page.goto('/?e2e-test');

  await test.step('Go to song list page', async () => {
    await pages.landingPage.enterTheGame();
    await pages.inputSelectionPage.skipToMainMenu();
    await pages.mainMenuPage.goToSingSong();
  });

  await test.step('Pick up at least 1 song language', async () => {
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(language);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Preview of random song should be visible', async () => {
    await expect(pages.songListPage.songPreviewElement).toBeVisible();
  });

  await test.step('Select a group name - the app scroll to the letter, showing results in the viewport', async () => {
    await pages.songListPage.goToGroupNavigation(groupName);
    await pages.songListPage.expectGroupToBeInViewport(groupName);
  });
});
