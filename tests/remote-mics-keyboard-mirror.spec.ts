import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';
import { RemoteMicPages } from './page-objects/remote-mic/initialise-remote-mic';
import { openAndConnectRemoteMicDirectly } from './steps/open-and-connect-remote-mic';

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
