import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const language1 = 'Polish';
const language2 = 'English';
const allPlaylist = 'All';
const song1 = 'e2e-single-english-1995';
const song2 = 'e2e-english-polish-1994';
const song3 = 'e2e-multitrack-polish-1994';

test('exclude languages from first start and menu', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Include all', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(language1);
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(language2);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.goToPlaylist(allPlaylist);
    await expect(await pages.songListPage.getSongElement(song1)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(song3)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(song2)).toBeVisible();
  });

  await test.step('Exclude Polish', async () => {
    await pages.songListPage.goBackToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.ensureSongLanguageIsDeselected(language1);
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(language2);
    await pages.songLanguagesPage.goBackToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songListPage.goToPlaylist(allPlaylist);
    await expect(await pages.songListPage.getSongElement(song1)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(song2)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(song3)).not.toBeVisible();
  });

  await test.step('Exclude English', async () => {
    await pages.songListPage.goBackToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(language1);
    await pages.songLanguagesPage.ensureSongLanguageIsDeselected(language2);
    await pages.songLanguagesPage.goBackToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songListPage.goToPlaylist(allPlaylist);
    await expect(await pages.songListPage.getSongElement(song2)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(song3)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(song1)).not.toBeVisible();
  });

  await test.step('Exclude all languages - excluded alert should be visible', async () => {
    await pages.songListPage.goBackToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.ensureAllLanguagesAreDeselected();
    await expect(pages.songLanguagesPage.allLanguagesExcludedAlert).toBeVisible();
  });

  await test.step('After `Backspace` key, changes should not be saved', async () => {
    await page.keyboard.press('Backspace');
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    test.fixme(true, 'Changes should not be saved');
    await page.waitForTimeout(1_000);
    await expect(pages.songLanguagesPage.allLanguagesExcludedAlert).not.toBeVisible();
  });
});
