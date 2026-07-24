import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';

let pages: ReturnType<typeof initialise>;

test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('Game volume slider is visible and persists through singing', async ({ page }) => {
  await page.goto('/?e2e-test');

  await test.step('Select Advanced input setup', async () => {
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectAdvancedSetup();
    await pages.advancedConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
  });

  await test.step('Show the control on song selection', async () => {
    await pages.songLanguagesPage.ensureSongLanguageIsSelected('English');
    await pages.songLanguagesPage.continueAndGoToSongList();
    await expect(pages.gamePage.gameVolumeControl).toBeVisible();
    await pages.gamePage.setGameVolume(0.42);
    await pages.gamePage.expectGameVolumeSliderValueToBe(0.42);
    await pages.gamePage.expectDirectVideoVolumeToBe(0.21);
  });

  await test.step('Keep the control visible while singing', async () => {
    await pages.songListPage.openPreviewForSong('e2e-single-english-1995');
    await pages.songPreviewPage.playTheSong(false);
    await expect(pages.gamePage.gameVolumeControl).toBeVisible();
    await pages.gamePage.expectGameVolumeSliderValueToBe(0.42);
    await pages.gamePage.expectDirectVideoVolumeToBe(0.21);
  });
});
