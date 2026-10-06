import { expect, test } from '@playwright/test';

import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const songLanguage = 'English';
const songID = 'e2e-single-english-1995';

test('Play without mics set up leads through the mic setup and then starts the song', async ({ page, browserName }) => {
  test.fixme(browserName === 'firefox', 'Test fails, because the mic in FF doesn`t work');
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Open the song preview', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(songLanguage);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.closeTheSelectionPlaylistTip();
    await pages.songListPage.focusSong(songID);
    await pages.songListPage.openPreviewForSong(songID);
    await pages.songPreviewPage.goNext();
  });

  await test.step('Backing out of the mic setup does not start the song', async () => {
    await pages.songPreviewPage.playButton.click();
    await page.getByTestId('skip').click();
    await expect(pages.inputSelectionPage.advancedButton).not.toBeVisible();
    await expect(pages.songPreviewPage.playButton).toBeVisible();
  });

  await test.step('Finishing the mic setup opened from Play starts the song', async () => {
    await pages.songPreviewPage.playButton.click();
    await pages.inputSelectionPage.selectComputersMicrophone();
    await expect(pages.computersMicConnectionPage.singSongButton).toHaveText('Play');
    await pages.computersMicConnectionPage.continueToTheSong();
    await pages.songPreviewPage.continueIntoTheSong();
  });

  await test.step('The song is being played', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(0)).toBeVisible();
  });
});

test('Setup mics keeps the preview open after finishing the setup', async ({ page, browserName }) => {
  test.fixme(browserName === 'firefox', 'Test fails, because the mic in FF doesn`t work');
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Open the song preview', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(songLanguage);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.closeTheSelectionPlaylistTip();
    await pages.songListPage.focusSong(songID);
    await pages.songListPage.openPreviewForSong(songID);
    await pages.songPreviewPage.goNext();
  });

  await test.step('Finish the setup from Setup mics', async () => {
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectComputersMicrophone();
    await expect(pages.computersMicConnectionPage.singSongButton).toHaveText('Continue to the song');
    await pages.computersMicConnectionPage.continueToTheSong();
  });

  await test.step('The preview is still shown', async () => {
    await expect(pages.songPreviewPage.playButton).toBeVisible();
    await expect(pages.gamePage.getSongLyricsForPlayerElement(0)).not.toBeVisible();
  });
});
