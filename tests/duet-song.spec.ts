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
const polishIsoCode = 'pl';
const duetPolSong = 'e2e-multitrack-polish-1994';
const polArtist = '2 E2ETest';
const polSongTitle = 'Multitrack';
const duetsPlaylist = 'Duets';

test('Sing a song intended for a duet as a single player', async ({ page, browserName }) => {
  test.fixme(browserName === 'firefox', 'Test fails, because the mic in FF doesn`t work');
  // test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Go to select song language', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(polishLang);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Go to duets-playlist and pick up the song', async () => {
    await pages.songListPage.closeTheSelectionPlaylistTip();
    await pages.songListPage.goToPlaylist(duetsPlaylist);
    await pages.songListPage.expectPlaylistToBeSelected(duetsPlaylist);
    await pages.songListPage.focusSong(duetPolSong);
    await expect(await pages.songListPage.getDuetSongIcon(duetPolSong)).toBeVisible();
    await pages.songListPage.expectSongToBeMarkedWithLanguageFlagIcon(duetPolSong, polishIsoCode);
    await pages.songListPage.openPreviewForSong(duetPolSong);
  });

  await test.step('Select computer`s mic', async () => {
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectComputersMicrophone();
  });

  await test.step('Enter player name and play the song with 1 player', async () => {
    await pages.computersMicConnectionPage.continueToTheSong();
    await expect(pages.songPreviewPage.getPlayerNameInput(player1)).toBeVisible();
    await pages.songPreviewPage.navigateAndEnterPlayerNameWithKeyboard(player1, player1Name);
    await expect(pages.songPreviewPage.getPlayerNameInput(player2)).not.toBeVisible();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('Artist and song title should be displayed', async () => {
    await pages.gamePage.expectArtistAndSongTitleToBeShown(polArtist, polSongTitle);
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

const duetSpanSong = 'e2e-pass-test-spanish-1994';
const artist = 'E2E-el-Dueto';
const songTitle = 'Pass Test';
const spanishLang = 'Spanish';
const spanishIsoCode = 'es';
const gameMode = 'Pass The Mic';

test('Sing a duet song in pass-the-mic mode as a single connected player', async ({ page, browserName }) => {
  test.fixme(browserName === 'firefox', 'Test fails, because the mic in FF doesn`t work');
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Select song language', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(spanishLang);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Go to duet playlist and pick up the song', async () => {
    await pages.songListPage.closeTheSelectionPlaylistTip();
    await pages.songListPage.goToPlaylist(duetsPlaylist);
    await pages.songListPage.expectPlaylistToBeSelected(duetsPlaylist);
    await expect(await pages.songListPage.getDuetSongIcon(duetSpanSong)).toBeVisible();
  });

  await test.step('Check visibility of song language flag and open song', async () => {
    await pages.songListPage.expectSongToBeMarkedWithLanguageFlagIcon(duetSpanSong, spanishIsoCode);
    await pages.songListPage.focusSong(duetSpanSong);
    await pages.songListPage.openPreviewForSong(duetSpanSong);
  });

  await test.step('Set Pass-The-Mic game mode', async () => {
    await pages.songPreviewPage.navigateToGameModeSettingsWithKeyboard();
    await pages.songPreviewPage.toggleGameMode(); // Duel
    await pages.songPreviewPage.toggleGameMode(); // Pass the mic
    await pages.songPreviewPage.expectGameModeToBe(gameMode);
  });

  await test.step('Go to select computer`s mic', async () => {
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectComputersMicrophone();
    await pages.computersMicConnectionPage.continueToTheSong();
  });

  await test.step('Enter player name and play the song with 1 player', async () => {
    await expect(pages.songPreviewPage.getPlayerNameInput(player1)).toBeVisible();
    await pages.songPreviewPage.navigateAndEnterPlayerNameWithKeyboard(player1, player1Name);
    await expect(pages.songPreviewPage.getPlayerNameInput(player2)).not.toBeVisible();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('Artist and song title should be displayed', async () => {
    await pages.gamePage.expectArtistAndSongTitleToBeShown(artist, songTitle);
  });

  await test.step('Song lyrics are enable just for player1', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(player1)).toBeVisible();
    await expect(pages.gamePage.getSongLyricsForPlayerElement(player2)).not.toBeVisible();
  });

  await test.step('Score should be visible for player1', async () => {
    await expect(pages.gamePage.getPlayerScoreElement(player1)).toBeVisible();
    await expect(pages.gamePage.getPlayerScoreElement(player2)).not.toBeVisible();
  });

  await test.step('Pass the mic progress and change indicator icon should be displayed', async () => {
    await expect(pages.gamePage.passTheMicProgressElement).toBeVisible();
    // await expect(pages.gamePage.changeIndicatorIcon).toBeVisible({ timeout: 20_000 });
    // await expect(pages.gamePage.changeIndicatorIcon).not.toBeVisible();
  });

  await test.step('After passing the mic, the lyrics are still only visible to player1', async () => {
    await expect(pages.gamePage.getSongLyricsForPlayerElement(player1)).toBeVisible();
    await expect(pages.gamePage.getSongLyricsForPlayerElement(player2)).not.toBeVisible();
  });

  await test.step('Player name and score are displayed for 1 player', async () => {
    await expect(pages.postGameResultsPage.skipScoreElement).toBeVisible({ timeout: 20_000 });
    await pages.postGameResultsPage.expectPlayerNameToBeDisplayed(player1, player1Name);
    await expect(pages.postGameResultsPage.getPlayerNameElement(player2)).not.toBeVisible();
    await expect(pages.postGameResultsPage.getPlayerScoreElement(player1)).toBeVisible();
  });
});
