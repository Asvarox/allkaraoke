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
const song1 = 'e2e-single-english-1995';
const song2 = 'e2e-english-polish-1994';
const song3 = 'e2e-multitrack-polish-1994';

test('exclude languages from first start and menu', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectAdvancedSetup();
  await pages.advancedConnectionPage.saveAndGoToSing();

  await test.step('Exclude Polish', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.unselectLanguage(language1); // turn off 'Polish'!
    await pages.songLanguagesPage.continueAndGoToSongList();
    await expect(pages.songListPage.getSongElement(song1)).toBeVisible();
    await expect(pages.songListPage.getSongElement(song2)).toBeVisible();
    await expect(pages.songListPage.getSongElement(song3)).not.toBeVisible();
  });

  await test.step('Exclude English', async () => {
    await page.keyboard.press('Backspace'); // Main menu
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.selectLanguage(language1);
    await pages.songLanguagesPage.unselectLanguage(language2);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.mainMenuPage.goToSingSong();
    await expect(pages.songListPage.getSongElement(song2)).toBeVisible();
    await expect(pages.songListPage.getSongElement(song3)).toBeVisible();
    await expect(pages.songListPage.getSongElement(song1)).not.toBeVisible();
  });

  await test.step('Include all', async () => {
    await page.keyboard.press('Backspace'); // Main menu
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.selectLanguage(language2);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.mainMenuPage.goToSingSong();
    await expect(pages.songListPage.getSongElement(song1)).toBeVisible();
    await expect(pages.songListPage.getSongElement(song3)).toBeVisible();
    await expect(pages.songListPage.getSongElement(song2)).toBeVisible();
  });

  await test.step('exclude all', async () => {
    await page.keyboard.press('Backspace'); // Main menu
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.unselectLanguage(language2);
    await pages.songLanguagesPage.unselectLanguage(language1);
    await expect(pages.songLanguagesPage.allLanguagesExcludedAlert).toBeVisible();
  });
});
