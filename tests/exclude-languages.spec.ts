import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const languages = {
  polish: 'Polish',
  english: 'English',
} as const;

const songsID = {
  pol: 'e2e-multitrack-polish-1994',
  eng: 'e2e-single-english-1995',
  pol_eng: 'e2e-english-polish-1994',
} as const;

const allPlaylist = 'All';

test('exclude languages from first start and menu', async ({ page }) => {
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Include all', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.expectLanguageToBeSelected(languages.polish);
    await pages.songLanguagesPage.expectLanguageToBeSelected(languages.english);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.goToPlaylist(allPlaylist);
    await expect(await pages.songListPage.getSongElement(songsID.pol)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songsID.eng)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songsID.pol_eng)).toBeVisible();
  });

  await test.step('Exclude Polish', async () => {
    await pages.songListPage.goBackToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.ensureLanguageToBeUnselected(languages.polish);
    await pages.songLanguagesPage.ensureLanguageToBeSelected(languages.english);
    await pages.songLanguagesPage.goBackToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songListPage.goToPlaylist(allPlaylist);
    await expect(await pages.songListPage.getSongElement(songsID.eng)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songsID.pol_eng)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songsID.pol)).not.toBeVisible();
  });

  await test.step('Exclude English', async () => {
    await pages.songListPage.goBackToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.ensureLanguageToBeSelected(languages.polish);
    await pages.songLanguagesPage.ensureLanguageToBeUnselected(languages.english);
    await pages.songLanguagesPage.goBackToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songListPage.goToPlaylist(allPlaylist);
    await expect(await pages.songListPage.getSongElement(songsID.pol)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songsID.pol_eng)).toBeVisible();
    await expect(await pages.songListPage.getSongElement(songsID.eng)).not.toBeVisible();
  });

  await test.step('Exclude all languages - excluded alert should be visible', async () => {
    await pages.songListPage.goBackToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToSelectSongLanguage();
    await pages.songLanguagesPage.ensureAllLanguagesToBe('unselected');
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
