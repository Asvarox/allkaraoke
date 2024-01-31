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
  await pages.inputSelectionPage.skipToMainMenu();
  await pages.mainMenuPage.goToManageSongs();
  await pages.manageSongsPage.goToEditSongs();
  await pages.editSongsPage.editSong(songID);

  await expect(pages.songEditingPage.urlSourceInput).toHaveValue(expectedURL);

  await pages.songEditingPage.nextStep();
  await expect(pages.songEditingPage.authorNameInput).toHaveValue(expectedAuthorName);
  await expect(pages.songEditingPage.authorUrlInput).toHaveValue(expectedAuthorURL);
  await expect(pages.songEditingPage.videoUrlInput).toHaveValue(expectedVideoURL);

  await pages.songEditingPage.nextStep();
  await expect(pages.songEditingPage.songLyrics).toBeVisible();

  await pages.songEditingPage.nextStep();
  await expect(pages.songEditingPage.songLanguageInput).toContainText(expectedSongLanguage);
  await expect(pages.songEditingPage.releaseYearInput).toHaveValue(expectedReleaseYear);
  await expect(pages.songEditingPage.bpmSongInput).toHaveValue(expectedSongBPM);
});
