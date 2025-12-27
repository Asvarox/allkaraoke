import { expect, test } from '@playwright/test';
import initialise from './PageObjects/initialise';
import { initTestMode, mockSongs } from './helpers';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

const player1_name = 'all-Karaoke';
const duetsPlaylist = 'Duets';

test('Sing a song intended for a duet as a single player', async ({ page, browserName }) => {
  const song = {
    ID: 'e2e-multitrack-polish-1994',
    artist: '2 E2ETest',
    title: 'Multitrack',
  } as const;

  const polish = {
    lang: 'Polish',
    isoCode: 'pl',
  } as const;

  test.fixme(browserName === 'firefox', 'Test fails, because the mic in FF doesn`t work');
  // test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Go to select song language', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureLanguageToBeSelected(polish.lang);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Go to duets-playlist and pick up the song', async () => {
    await pages.songListPage.goToPlaylist(duetsPlaylist);
    await pages.songListPage.expectPlaylistToBeSelected(duetsPlaylist);
    await pages.songListPage.ensureSongToBeSelected(song.ID);
    await expect(await pages.songListPage.getDuetSongIcon(song.ID)).toBeVisible();
    await pages.songListPage.expectSongToBeMarkedWithLanguageFlagIcon(song.ID, polish.isoCode);
    await pages.songListPage.openSongPreview(song.ID);
  });

  await test.step('Select computer`s mic', async () => {
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectComputersMicrophone();
  });

  await test.step('Enter player name and play the song with 1 player', async () => {
    await pages.computersMicConnectionPage.continueToTheSong();
    await expect(pages.songPreviewPage.getPlayerNameInput('p1')).toBeVisible();
    await pages.songPreviewPage.navigateAndEnterPlayerNameWithKeyboard('p1', player1_name);
    await expect(pages.songPreviewPage.getPlayerNameInput('p2')).not.toBeVisible();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('Artist and song title should be displayed', async () => {
    await pages.gamePage.expectArtistAndSongTitleToBeShown(song.artist, song.title);
  });

  await test.step('Duet song lyrics are enable just for 1 player', async () => {
    await expect(pages.gamePage.getPlayerLyricsContainer('p1')).toBeVisible();
    await expect(pages.gamePage.getPlayerLyricsContainer('p2')).not.toBeVisible();
  });

  await test.step('Score should be visible as cooperative, because the co-op mode is set', async () => {
    await expect(pages.gamePage.getPlayerScoreElement('coop')).toBeVisible();
    await expect(pages.gamePage.getPlayerScoreElement('p2')).not.toBeVisible();
  });

  await test.step('Player name and score are displayed for 1 player', async () => {
    await expect(pages.postGameResultsPage.skipScoresButton).toBeVisible({ timeout: 20_000 });
    await pages.postGameResultsPage.expectPlayerNameToBe('p1', player1_name);

    await expect(pages.postGameResultsPage.getPlayerScoreElement('p1')).toBeVisible();
    await expect(pages.postGameResultsPage.getPlayerScoreElement('p2')).not.toBeVisible();
    await expect(pages.postGameResultsPage.getPlayerNameElement('p2')).not.toBeVisible();
  });
});

test('Sing a duet song in pass-the-mic mode as a single connected player', async ({ page, browserName }) => {
  const song = {
    ID: 'e2e-pass-test-spanish-1994',
    artist: 'E2E-el-Dueto',
    title: 'Pass Test',
  } as const;

  const spanish = {
    lang: 'Spanish',
    isoCode: 'es',
  } as const;

  test.fixme(browserName === 'firefox', 'Test fails, because the mic in FF doesn`t work');
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();

  await test.step('Select song language', async () => {
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureLanguageToBeSelected(spanish.lang);
    await pages.songLanguagesPage.continueAndGoToSongList();
  });

  await test.step('Go to duet playlist and pick up the song', async () => {
    await pages.songListPage.goToPlaylist(duetsPlaylist);
    await pages.songListPage.expectPlaylistToBeSelected(duetsPlaylist);
    await expect(await pages.songListPage.getDuetSongIcon(song.ID)).toBeVisible();
  });

  await test.step('Check visibility of song language flag and open song', async () => {
    await pages.songListPage.expectSongToBeMarkedWithLanguageFlagIcon(song.ID, spanish.isoCode);
    await pages.songListPage.openSongPreview(song.ID);
  });

  await test.step('Set Pass-The-Mic game mode', async () => {
    await pages.songPreviewPage.navigateToGameModeSettingsWithKeyboard();
    await pages.songPreviewPage.ensureGameModeToBeSet('Pass The Mic');
  });

  await test.step('Go to select computer`s mic', async () => {
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectComputersMicrophone();
    await pages.computersMicConnectionPage.continueToTheSong();
  });

  await test.step('Enter player name and play the song with 1 player', async () => {
    await expect(pages.songPreviewPage.getPlayerNameInput('p1')).toBeVisible();
    await pages.songPreviewPage.navigateAndEnterPlayerNameWithKeyboard('p1', player1_name);
    await expect(pages.songPreviewPage.getPlayerNameInput('p2')).not.toBeVisible();
    await pages.songPreviewPage.playTheSong();
  });

  await test.step('Artist and song title should be displayed', async () => {
    await pages.gamePage.expectArtistAndSongTitleToBeShown(song.artist, song.title);
  });

  await test.step('Song lyrics are enable just for player1', async () => {
    await expect(pages.gamePage.getPlayerLyricsContainer('p1')).toBeVisible();
    await expect(pages.gamePage.getPlayerLyricsContainer('p2')).not.toBeVisible();
  });

  await test.step('Score should be visible for player1', async () => {
    await expect(pages.gamePage.getPlayerScoreElement('p1')).toBeVisible();
    await expect(pages.gamePage.getPlayerScoreElement('p2')).not.toBeVisible();
  });

  await test.step('Pass the mic progress and change indicator icon should be displayed', async () => {
    await expect(pages.gamePage.passTheMicProgressElement).toBeVisible();
    // await expect(pages.gamePage.changeIndicatorIcon).toBeVisible({ timeout: 20_000 });
    // await expect(pages.gamePage.changeIndicatorIcon).not.toBeVisible();
  });

  await test.step('After passing the mic, the lyrics are still only visible to player1', async () => {
    await expect(pages.gamePage.getPlayerLyricsContainer('p1')).toBeVisible();
    await expect(pages.gamePage.getPlayerLyricsContainer('p2')).not.toBeVisible();
  });

  await test.step('Player name and score are displayed for 1 player', async () => {
    await expect(pages.postGameResultsPage.skipScoresButton).toBeVisible({ timeout: 20_000 });
    await pages.postGameResultsPage.expectPlayerNameToBe('p1', player1_name);
    await expect(pages.postGameResultsPage.getPlayerScoreElement('p1')).toBeVisible();
    await expect(pages.postGameResultsPage.getPlayerNameElement('p2')).not.toBeVisible();
  });
});
