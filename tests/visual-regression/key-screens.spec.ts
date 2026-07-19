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
  // The history container mounts immediately but shows a loading skeleton while it reads play
  // stats from IndexedDB - wait for the empty state (no plays are ever seeded here) rather than
  // just the container, or the screenshot can race the skeleton under load.
  await expect(page.getByTestId('history-empty-state')).toBeVisible();

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

// Keyboard mirroring: what the connected remote renders depends on what screen the host is on.
// On an in-game screen that opts into mirroring (Options here), the remote renders that screen's
// controls directly. On the actual song browser, the remote instead renders the bespoke
// song-selection layout - search box + arrow pad + "Random Song" - instead of either the mirrored
// controls or the generic classic nav pad. Both are captured from a single paired remote mic
// (pairing involves a real WS handshake, so reconnecting a second time per test would be wasteful).
// `page` is the host, same as every other remote-mic test, so it needs its normal desktop viewport
// back (the harness pins it to the mobile size this test is named after, but that's meant for the
// remote); the remote connects via the usual openAndConnectRemoteMicDirectly helper, with its
// viewport set to the mobile target size.
visual(
  'Remote mic mirrored & song-selection keyboards',
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
    await makeScreenshot('mirrored-keyboard', {
      page: remoteMic._page,
      extraMasks: [remoteMic.remoteMicMainPage.connectionStatusElement],
    });

    // Host moves on to the song browser, which publishes the song-selection layout to the remote.
    await page.getByTestId('back-button').click();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureAllLanguagesAreSelected();
    await pages.songLanguagesPage.continueAndGoToSongList();

    await remoteMic.remoteMicMainPage.expectKeyboardModeToBe('song-selection');
    await expect(remoteMic._page.getByTestId('keyboard-shift-r')).toBeVisible();

    await makeScreenshot('song-selection-keyboard', {
      page: remoteMic._page,
      extraMasks: [remoteMic.remoteMicMainPage.connectionStatusElement],
    });
  },
);
