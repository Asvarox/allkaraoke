import { expect, test } from '@playwright/test';

import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';
import { RemoteMicPages } from './page-objects/remote-mic/initialise-remote-mic';
import { openAndConnectRemoteMicDirectly } from './steps/open-and-connect-remote-mic';

// Service worker caches index.json which breaks playwright's request intercept (mocking of song list)
test.use({ serviceWorkers: 'block' });

const song = 'e2e-multitrack-polish-1994';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test.beforeEach(async ({ page }) => {
  await test.step('Enter the game and go to select Smartphones setup', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await pages.mainMenuPage.goToInputSelectionPage();
    await pages.inputSelectionPage.selectSmartphones();
  });
});

test('Mirrors the main menu on the remote mic and navigates directly from it', async ({ browser, page }) => {
  let remoteMic: RemoteMicPages;

  await test.step('Connect a remote mic with control permission', async () => {
    remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
  });

  await test.step('Return to the main menu on the host', async () => {
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.waitForContainer();
  });

  const remoteMicMainPage = remoteMic!.remoteMicMainPage;
  const singSongControl = remoteMicMainPage.mirroredControl('sing-a-song');
  const settingsControl = remoteMicMainPage.mirroredControl('settings');

  await test.step('Remote mic shows the mirrored main menu instead of the arrow keyboard', async () => {
    await remoteMicMainPage.expectKeyboardModeToBe('mirror');
    await expect(singSongControl).toBeVisible();
    await expect(settingsControl).toBeVisible();
    await expect(remoteMicMainPage.arrowUpButton).toBeHidden();
  });

  await test.step('Tapping the mirrored Settings button opens Settings on the host', async () => {
    await settingsControl.click();

    await expect(page.getByTestId('graphics-level')).toBeVisible();
  });
});

test('Mirrors the exclude-languages screen on the remote mic and toggles a language directly', async ({
  browser,
  page,
}) => {
  let remoteMic: RemoteMicPages;

  await test.step('Connect a remote mic with control permission', async () => {
    remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
  });

  await test.step('Open the exclude-languages screen on the host', async () => {
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
  });

  const remoteMicMainPage = remoteMic!.remoteMicMainPage;
  const polishControl = remoteMicMainPage.mirroredControl('lang-Polish');
  const closeControl = remoteMicMainPage.mirroredControl('close-exclude-languages');

  await test.step('Remote mic shows the mirrored language checkboxes instead of the arrow keyboard', async () => {
    await remoteMicMainPage.expectKeyboardModeToBe('mirror');
    await expect(polishControl).toBeVisible();
    await expect(closeControl).toBeVisible();
    await expect(remoteMicMainPage.arrowUpButton).toBeHidden();
  });

  await test.step('Tapping the mirrored checkbox toggles the language on the host', async () => {
    const hostCheckbox = pages.songLanguagesPage.getCheckbox('Polish');
    const hostBefore = await hostCheckbox.getAttribute('data-checked');

    await polishControl.click();

    await expect(hostCheckbox).not.toHaveAttribute('data-checked', hostBefore ?? '');
  });

  await test.step('Tapping the mirrored close button continues to song selection on the host', async () => {
    await pages.songLanguagesPage.ensureSongLanguageIsSelected('Polish');
    await closeControl.click();

    await expect(page.getByTestId('song-preview')).toBeVisible();
  });
});

test('Mirrors in-game Options controls on the remote mic and toggles them directly', async ({ browser, page }) => {
  let remoteMic: RemoteMicPages;

  await test.step('Connect a remote mic with control permission', async () => {
    remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
  });

  await test.step('Open the in-game Options screen on the host', async () => {
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSetting();
  });

  const remoteMicMainPage = remoteMic!.remoteMicMainPage;
  const graphicsControl = remoteMicMainPage.mirroredControl('graphics-level');
  const backControl = remoteMicMainPage.mirroredControl('back-button');

  await test.step('Remote mic shows the mirrored controls instead of the arrow keyboard', async () => {
    await remoteMicMainPage.expectKeyboardModeToBe('mirror');
    await expect(graphicsControl).toBeVisible();
    await expect(backControl).toBeVisible();
    // Arrow d-pad must not be present in mirror mode, and there's no separate injected back button —
    // the mirrored "Return To Main Menu" button (above) is the only way back.
    await expect(remoteMicMainPage.arrowUpButton).toBeHidden();
    await expect(remoteMicMainPage.backArrowKeyboardButton).toBeHidden();
  });

  await test.step('Tapping the mirrored switch changes the setting in-game and reflects back on the remote', async () => {
    const remoteBefore = await graphicsControl.textContent();
    const hostGraphics = pages.settingsPage.graphicsLevelElement;
    const hostBefore = await hostGraphics.textContent();

    await graphicsControl.click();

    // The tap drives the exact same on-screen action…
    await expect(hostGraphics).not.toHaveText(hostBefore ?? '');
    // …and the new value is pushed back so the remote stays in sync.
    await expect(graphicsControl).not.toHaveText(remoteBefore ?? '');
  });
});

test('Mirrors the song settings controls on the remote mic once a song is selected', async ({ browser, page }) => {
  let remoteMic: RemoteMicPages;

  await test.step('Connect a remote mic with control permission', async () => {
    remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
  });

  await test.step('Open the song settings for a song on the host', async () => {
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSingSong();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected('Polish');
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.closeTheSelectionPlaylistTip();
    await pages.songListPage.focusSong(song);
    await pages.songListPage.openPreviewForSong(song);
    await pages.songPreviewPage.goNext();
  });

  const remoteMicMainPage = remoteMic!.remoteMicMainPage;
  const difficultyControl = remoteMicMainPage.mirroredControl('difficulty-setting');
  const modeControl = remoteMicMainPage.mirroredControl('game-mode-setting');
  const playControl = remoteMicMainPage.mirroredControl('play-song-button');
  const exitControl = remoteMicMainPage.mirroredControl('exit-song-settings');

  await test.step('Remote mic shows the mirrored song settings instead of the arrow keyboard', async () => {
    await remoteMicMainPage.expectKeyboardModeToBe('mirror');
    await expect(difficultyControl).toBeVisible();
    await expect(modeControl).toBeVisible();
    await expect(playControl).toBeVisible();
    await expect(remoteMicMainPage.arrowUpButton).toBeHidden();
    // The remote-only back control stands in for the on-screen back button this screen doesn't have.
    await expect(exitControl).toBeVisible();
  });

  await test.step('Tapping the mirrored difficulty switch changes it in-game and reflects back', async () => {
    const remoteBefore = await difficultyControl.textContent();
    const hostDifficulty = page.getByTestId('difficulty-setting');
    const hostBefore = await hostDifficulty.getAttribute('data-test-value');

    await difficultyControl.click();

    await expect(hostDifficulty).not.toHaveAttribute('data-test-value', hostBefore ?? '');
    await expect(difficultyControl).not.toHaveText(remoteBefore ?? '');
  });

  await test.step('Tapping the remote-only back control closes the song settings on the host', async () => {
    await exitControl.click();

    // Back on the song list: its own bespoke keyboard takes over on the remote.
    await remoteMicMainPage.expectKeyboardModeToBe('song-selection');
  });
});

test('Mirrors the Manage Songs menu on the remote mic and navigates directly from it', async ({ browser, page }) => {
  let remoteMic: RemoteMicPages;

  await test.step('Connect a remote mic with control permission', async () => {
    remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
  });

  await test.step('Open Manage Songs on the host', async () => {
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToManageSongs();
  });

  const remoteMicMainPage = remoteMic!.remoteMicMainPage;
  const excludeLanguagesControl = remoteMicMainPage.mirroredControl('exclude-languages');
  const backControl = remoteMicMainPage.mirroredControl('back-button');

  await test.step('Remote mic shows the mirrored menu instead of the arrow keyboard', async () => {
    await remoteMicMainPage.expectKeyboardModeToBe('mirror');
    await expect(excludeLanguagesControl).toBeVisible();
    await expect(backControl).toBeVisible();
    await expect(remoteMicMainPage.arrowUpButton).toBeHidden();
  });

  await test.step('Tapping the mirrored button navigates on the host', async () => {
    await excludeLanguagesControl.click();

    await expect(page.getByTestId('close-exclude-languages')).toBeVisible();
  });
});

test('Mirrors the Remote Microphone Settings screen on the remote mic and toggles the default permission directly', async ({
  browser,
  page,
}) => {
  let remoteMic: RemoteMicPages;

  await test.step('Connect a remote mic with control permission', async () => {
    remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
  });

  await test.step('Open Remote Microphone Settings on the host', async () => {
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSetting();
    await pages.settingsPage.openRemoteMicSettings();
  });

  const remoteMicMainPage = remoteMic!.remoteMicMainPage;
  const connectionTypeControl = remoteMicMainPage.mirroredControl('connection type');
  const defaultPermissionControl = remoteMicMainPage.mirroredControl('default-permission');
  const backControl = remoteMicMainPage.mirroredControl('back-button');

  await test.step('Remote mic shows the mirrored controls, including the connected device, instead of the arrow keyboard', async () => {
    await remoteMicMainPage.expectKeyboardModeToBe('mirror');
    await expect(connectionTypeControl).toBeVisible();
    await expect(defaultPermissionControl).toBeVisible();
    await expect(backControl).toBeVisible();
    await expect(remoteMicMainPage.arrowUpButton).toBeHidden();
  });

  await test.step('Tapping the mirrored switch changes the default permission on the host', async () => {
    await pages.settingsPage.expectDefaultPermissionToBeWrite();

    await defaultPermissionControl.click();

    await pages.settingsPage.expectDefaultPermissionToBeRead();
  });
});

test('Mirrors the calibration screen on the remote mic and adjusts input lag directly', async ({ browser, page }) => {
  let remoteMic: RemoteMicPages;

  await test.step('Connect a remote mic with control permission', async () => {
    remoteMic = await openAndConnectRemoteMicDirectly(page, browser, 'Player 1');
  });

  await test.step('Open the calibration screen on the host', async () => {
    await pages.smartphonesConnectionPage.goToMainMenu();
    await pages.mainMenuPage.goToSetting();
    await pages.settingsPage.goToCalibration();
  });

  const remoteMicMainPage = remoteMic!.remoteMicMainPage;
  const inputLagControl = remoteMicMainPage.mirroredControl('input-lag');
  const saveControl = remoteMicMainPage.mirroredControl('save');

  await test.step('Remote mic shows the mirrored input-lag stepper and save button instead of the arrow keyboard', async () => {
    await remoteMicMainPage.expectKeyboardModeToBe('mirror');
    await expect(inputLagControl).toBeVisible();
    await expect(saveControl).toBeVisible();
    await expect(remoteMicMainPage.arrowUpButton).toBeHidden();
  });

  await test.step('Adjusting the mirrored stepper changes the input lag on the host', async () => {
    await inputLagControl.getByTestId('numeric-input-up').click();

    await pages.calibration.expectInputLagToBe('50');
  });
});
