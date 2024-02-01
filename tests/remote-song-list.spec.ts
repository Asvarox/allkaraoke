import { expect, test } from '@playwright/test';
import { txtfile } from './fixtures/newsongtxt';
import { initTestMode, mockSongs } from './helpers';
import { connectRemoteMic, openRemoteMic } from './steps/openAndConnectRemoteMic';

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

const P1_Name = 'E2E Test Blue';
const songID = 'zzz-last-polish-1994';
const videoURL = 'https://www.youtube.com/watch?v=8YKAHgwLEMg';
const convertedSongID = 'convert-test';

test('Remote mic song list', async ({ page, context, browserName }) => {
  test.fixme(browserName === 'firefox', 'Test fails super often on FF');
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await pages.inputSelectionPage.selectSmartphones();

  const remoteMic = await openRemoteMic(page, context);
  await remoteMic.getByTestId('player-name-input').fill(P1_Name);

  await test.step('Song list is available without connecting', async () => {
    await remoteMic.getByTestId('menu-song-list').click();
    await expect(remoteMic.getByTestId(songID)).toBeVisible();
  });

  await test.step('Song list doesnt contain removed songs after connecting', async () => {
    await remoteMic.getByTestId('menu-microphone').click();
    await connectRemoteMic(remoteMic);

    await pages.smartphonesConnectionPage.goToMainMenuPage();
    await pages.mainMenuPage.goToManageSongs();
    await pages.manageSongsPage.goToEditSongs();
    await pages.editSongsPage.hideSong(songID);
    await pages.editSongsPage.expectSongToBeHidden(songID);
    await expect(remoteMic.getByTestId(songID)).not.toBeVisible();
  });

  await test.step('Song list contains custom songs after connecting', async () => {
    await pages.editSongsPage.goToImportUltrastar();
    await pages.songEditBasicInfoPage.enterSongTXT(txtfile);
    await pages.songEditBasicInfoPage.nextStep();
    await pages.songEditAuthorAndVideoPage.enterVideoURL(videoURL);
    await pages.songEditAuthorAndVideoPage.nextStep();
    await pages.songEditSyncLyricsToVideoPage.nextStep();
    await pages.songEditMetadataPage.saveChanges();
    await pages.editSongsPage.disagreeToShareAddSongs();
    await pages.editSongsPage.expectSongToBeVisible(convertedSongID);
    await remoteMic.getByTestId('menu-song-list').click();
    await expect(remoteMic.getByTestId(convertedSongID)).toBeVisible();
  });
});
