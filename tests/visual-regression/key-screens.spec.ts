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

    // Both the live ping counter (top bar) and the mic volume/frequency preview redraw from the fake
    // audio input every frame, so mask them on every remote capture to keep the screenshots stable.
    const remoteMasks = [
      remoteMic.remoteMicMainPage.connectionStatusElement,
      remoteMic.remoteMicMainPage.indicatorElement,
    ];

    await remoteMic.remoteMicMainPage.expectKeyboardModeToBe('mirror');
    await expect(remoteMic.remoteMicMainPage.mirroredControl('graphics-level')).toBeVisible();

    await makeScreenshot('mirrored-keyboard', {
      page: remoteMic._page,
      extraMasks: remoteMasks,
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
      extraMasks: remoteMasks,
    });

    // Host expands a song's settings, which publishes the song-settings mirror layout to the remote
    // (difficulty/mode/track switchers, "Setup mics"/"Play" buttons and the remote-only back control).
    await pages.songListPage.focusSong('e2e-multitrack-polish-1994');
    await pages.songListPage.openPreviewForSong('e2e-multitrack-polish-1994');

    await remoteMic.remoteMicMainPage.expectKeyboardModeToBe('mirror');
    await expect(remoteMic.remoteMicMainPage.mirroredControl('difficulty-setting')).toBeVisible();

    await makeScreenshot('song-settings-keyboard', {
      page: remoteMic._page,
      extraMasks: remoteMasks,
    });
  },
);

// The in-game screens mirror to the remote too, and each has a distinctly shaped layout worth
// pinning: a single action (skip intro), a plain menu with a numeric stepper in it (pause menu),
// a checkbox list (rate song) and the post-game buttons. They share one test because the expensive
// part is getting into a song at all - picking inputs, pairing a real remote mic over WS and
// starting playback - while each screen after that is one keypress away.
//
// The host is driven with the regular keyboard throughout: these screens no longer expose an arrow
// pad on the remote, which is the whole point of what's being captured here.
visual(
  'Remote mic in-game mirrored keyboards',
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
    // Same fullscreen caveat as the test above - back out before resizing to the phone viewport.
    await remoteMic._page.evaluate(() => document.exitFullscreen?.().catch(() => {}));
    await remoteMic._page.setViewportSize(viewport);

    const remoteMasks = [
      remoteMic.remoteMicMainPage.connectionStatusElement,
      remoteMic.remoteMicMainPage.indicatorElement,
    ];

    // A song with a long intro, so the skip-intro prompt (and its mirrored control) actually appears.
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureAllLanguagesAreSelected();
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.openPreviewForSong('e2e-skip-intro-polish');
    await pages.songPreviewPage.navigateToPlayTheSongWithKeyboard();
    await pages.calibration.approveDefaultCalibrationSetting();
    await remoteMic.remoteMicMainPage.pressReadyOnRemoteMic();

    // Skip intro: a single mirrored action plus the remote-only "Pause menu" back control, since the
    // phone has no generic Back button once a screen is mirrored.
    await expect(pages.gamePage.skipIntroElement).toBeVisible({ timeout: 15_000 });
    await remoteMic.remoteMicMainPage.expectKeyboardModeToBe('mirror');
    await expect(remoteMic.remoteMicMainPage.mirroredControl('skip-intro')).toBeVisible();

    await makeScreenshot('skip-intro-keyboard', { page: remoteMic._page, extraMasks: remoteMasks });

    // Pause menu: the only mirrored screen carrying a non-tappable control - the input-lag stepper.
    await pages.gamePage.goToPauseMenuByKeyboard();
    await expect(remoteMic.remoteMicMainPage.mirroredControl('button-resume-song')).toBeVisible();
    await expect(remoteMic.remoteMicMainPage.mirroredControl('input-lag')).toBeVisible();

    await makeScreenshot('pause-menu-keyboard', { page: remoteMic._page, extraMasks: remoteMasks });

    // Rate song: reached by exiting early (the rating prompt only shows for an unfinished song).
    await pages.gamePage.navigateAndApproveWithKeyboard('button-exit-song');
    await expect(remoteMic.remoteMicMainPage.mirroredControl('button-song-ok')).toBeVisible();

    await makeScreenshot('rate-song-keyboard', { page: remoteMic._page, extraMasks: remoteMasks });

    // Post-game results. The score animation renames this control from "Skip" to "Next", so wait for
    // the settled label. Deliberately NOT clicking "skip animation" to get there: once the animation
    // has finished on its own that same element has become the "next step" button, so clicking it
    // races into navigating off this screen entirely.
    await pages.rateUnfinishedSongPage.submitIssueWithKeyboard();
    await expect(remoteMic.remoteMicMainPage.mirroredControl('next-button')).toHaveText(/next/i, {
      timeout: 15_000,
    });

    await makeScreenshot('post-game-keyboard', { page: remoteMic._page, extraMasks: remoteMasks });
  },
);
