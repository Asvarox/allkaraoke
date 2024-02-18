import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
// Not disabling it globally so in case SW breaks the app it is caught by other tests
test.use({ serviceWorkers: 'block' });

const songID = 'e2e-single-english-1995';
const expectedURL = 'sourceUrl';
const expectedAuthorName = 'author';
const expectedAuthorURL = 'authorUrl';
const expectedVideoURL = 'https://www.youtube.com/watch?v=W9nZ6u15yis';
const expectedSongLanguage = 'English';
const expectedReleaseYear = '1995';
const expectedSongBPM = '200';

test('Edit song', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Go to Edit Song Page and pick up the song to edit', async () => {
    await pages.inputSelectionPage.skipToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
    await pages.editSongsPage.editSong(songID);
  });

  await test.step('Check basic song info', async () => {
    await expect(pages.songEditBasicInfoPage.urlSourceInput).toHaveValue(expectedURL);
  });

  await test.step('Check info about author and video', async () => {
    await pages.songEditBasicInfoPage.goToAuthorAndVideoStep();
    await expect(pages.songEditAuthorAndVideoPage.authorNameInput).toHaveValue(expectedAuthorName);
    await expect(pages.songEditAuthorAndVideoPage.authorUrlInput).toHaveValue(expectedAuthorURL);
    await expect(pages.songEditAuthorAndVideoPage.videoUrlInput).toHaveValue(expectedVideoURL);
  });

  await test.step('Go to sync lyrics to video Step', async () => {
    await pages.songEditAuthorAndVideoPage.goToSyncLyricsStep();
    await expect(pages.songEditSyncLyricsToVideoPage.pageContainer).toBeVisible();
  });

  await test.step('Check song metadata', async () => {
    await pages.songEditSyncLyricsToVideoPage.goToMetadataStep();
    await expect(pages.songEditMetadataPage.songLanguageElement).toContainText(expectedSongLanguage);
    await expect(pages.songEditMetadataPage.releaseYearInput).toHaveValue(expectedReleaseYear);
    await expect(pages.songEditMetadataPage.bpmSongInput).toHaveValue(expectedSongBPM);
  });
});
