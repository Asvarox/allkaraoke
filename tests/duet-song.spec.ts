import { expect, test } from '@playwright/test';
import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const player1 = 0;
const player2 = 1;
const player1Name = 'all-Karaoke';
const polishLang = 'Polish';
const duetsPlaylist = 'Duets';
const duetSong = 'e2e-multitrack-polish-1994';

test('Sing a song intended for a duet as a single player', async ({ page, context, browser, browserName }) => {
  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Skip to main menu', async () => {
    await pages.inputSelectionPage.skipToMainMenu();
    await pages.mainMenuPage.goToSingSong();
  });

  await test.step('Select song language', async () => {
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(polishLang);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Go to duets-playlist and pick up the song', async () => {
    await pages.songListPage.goToPlaylist(duetsPlaylist);
    await pages.songListPage.expectPlaylistToBeSelected(duetsPlaylist);
    await pages.songListPage.navigateToSongWithKeyboard(duetSong);
    await pages.songListPage.openPreviewForSong(duetSong);
  });

  await test.step('Select computer`s mic', async () => {
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.setupMics();
    await pages.inputSelectionPage.selectComputersMicrophone();
  });

  await test.step('Enter player name and play the song with 1 player', async () => {
    await pages.computersMicConnectionPage.continueToTheSong();
    await expect(pages.songPreviewPage.getPlayerNameInput(player1)).toBeVisible();
    await pages.songPreviewPage.navigateAndEnterPlayerNameWithKeyboard(player1, player1Name);
    await expect(pages.songPreviewPage.getPlayerNameInput(player2)).not.toBeVisible();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('Duet song lyrics are enable just for 1 player', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(player1)).toBeVisible();
    await expect(pages.gamePage.getSongLyricsForPlayerElement(player2)).not.toBeVisible();
  });

  await test.step('Score should be visible as cooperative, because the co-op mode is set', async () => {
    await expect(pages.gamePage.playersCoopScoreElement).toBeVisible();
    await expect(pages.gamePage.getPlayerScoreElement(player2)).not.toBeVisible();
  });

  await test.step('Player name and score are displayed for 1 player', async () => {
    await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible({ timeout: 20_000 });
    await pages.postGameResultsPage.expectPlayerNameToBeDisplayed(player1, player1Name);
    await expect(pages.postGameResultsPage.getPlayerNameElement(player2)).not.toBeVisible();

    await expect(pages.postGameResultsPage.getPlayerScoreElement(player1)).toBeVisible();
    await expect(pages.postGameResultsPage.getPlayerScoreElement(player2)).not.toBeVisible();
  });
});
