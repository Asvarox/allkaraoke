import { expect } from '@playwright/test';

import { mockSongs } from '../helpers';
import initialise from '../page-objects/initialise';
import { openAndConnectRemoteMicDirectly } from '../steps/open-and-connect-remote-mic';
import { REMOTE_MIC_VIEWPORTS, VIEWPORTS, visual } from './visual';

visual('Landing page', async ({ page, makeScreenshot }) => {
  await page.goto('/?e2e-test');
  await expect(page.getByTestId('enter-the-game').and(page.locator(':visible'))).toBeVisible();

  await makeScreenshot();
});

visual('Main menu', async ({ page, makeScreenshot }) => {
  // Navigating directly (rather than clicking through the landing page) avoids the landing page's
  // viewport-dependent CTA, which on narrow viewports leads to quick-setup instead of the main menu.
  await page.goto('/menu/?e2e-test');
  await expect(page.getByTestId('sing-a-song')).toBeVisible();

  await makeScreenshot();
});

visual('History', async ({ page, makeScreenshot }) => {
  await page.goto('/menu/?e2e-test');
  await page.getByTestId('history').click();
  await expect(page.getByTestId('history-page')).toBeVisible();

  await makeScreenshot();
});

visual('Remote mic', REMOTE_MIC_VIEWPORTS, async ({ page, context, makeScreenshot }) => {
  await mockSongs({ page, context });

  await page.goto('/remote-mic/?e2e-test');
  await expect(page.getByTestId('game-code-input')).toBeVisible();
  await makeScreenshot('connect');

  await page.getByTestId('menu-song-list').click();
  await expect(page.getByTestId('all-songs-button')).toBeVisible();
  await makeScreenshot('song-list');

  await page.getByTestId('menu-settings').click();
  await expect(page.getByTestId('remote-mic-id')).toBeVisible();
  await makeScreenshot('settings');
});

// Mirrored keyboard: when the host is on an in-game screen that opts into mirroring (Options here),
// the connected remote renders that screen's controls directly. `page` is the host, same as every
// other remote-mic test, so it needs its normal desktop viewport back (the harness pins it to the
// mobile size this test is named after, but that's meant for the remote); the remote connects via
// the usual openAndConnectRemoteMicDirectly helper, with its viewport set to the mobile target size.
visual(
  'Remote mic mirrored keyboard',
  REMOTE_MIC_VIEWPORTS,
  async ({ page, context, browser, viewport, makeScreenshot }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await mockSongs({ page, context });
    const pages = initialise(page, context, browser);

    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectSmartphones();

    const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
    // The connection wizard auto-enters real browser fullscreen, which blocks resizing the viewport
    // (Chromium refuses `setWindowBounds` while fullscreen) - back out of it first.
    await remoteMic._page.evaluate(() => document.exitFullscreen?.().catch(() => {}));
    await remoteMic._page.setViewportSize(viewport);

    // Host opens the in-game Options screen, which publishes the mirrored layout to the remote.
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSetting();

    await remoteMic.remoteMicMainPage.expectKeyboardModeToBe('mirror');
    await expect(remoteMic.remoteMicMainPage.mirroredControl('graphics-level')).toBeVisible();

    // Mask the live ping counter in the top bar so the screenshot stays deterministic.
    await makeScreenshot(undefined, {
      page: remoteMic._page,
      extraMasks: [remoteMic.remoteMicMainPage.connectionStatusElement],
    });
  },
);

// Song-selection keyboard: when the host is on the actual song browser (not just any in-game
// screen), the remote renders the bespoke song-selection layout - search box + arrow pad +
// "Random Song" - instead of the generic classic nav pad.
visual(
  'Remote mic song-selection keyboard',
  REMOTE_MIC_VIEWPORTS,
  async ({ page, context, browser, viewport, makeScreenshot }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await mockSongs({ page, context });
    const pages = initialise(page, context, browser);

    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectSmartphones();

    const remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
    await remoteMic._page.evaluate(() => document.exitFullscreen?.().catch(() => {}));
    await remoteMic._page.setViewportSize(viewport);

    // Host opens the song browser, which publishes the song-selection layout to the remote.
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureAllLanguagesAreSelected();
    await pages.songLanguagesPage.continueAndGoToSongList();

    await remoteMic.remoteMicMainPage.expectKeyboardModeToBe('song-selection');
    await expect(remoteMic._page.getByTestId('keyboard-shift-r')).toBeVisible();

    await makeScreenshot(undefined, {
      page: remoteMic._page,
      extraMasks: [remoteMic.remoteMicMainPage.connectionStatusElement],
    });
  },
);
