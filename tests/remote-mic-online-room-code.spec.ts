import { devices, expect, test } from '@playwright/test';

import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';
import { createOnlineRoom } from './steps/create-online-room';
import { newPlayerPage } from './steps/new-player-page';

// Online room codes start with a digit, remote-mic game codes with a letter — a room code typed into
// the phone's "Game code" screen goes to its online room instead of failing to connect as a mic.

test.beforeEach(async ({ page, context }) => {
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('Remote mic: an online room code takes the phone to that online room', async ({ page, context, browser }) => {
  const pages = initialise(page, context, browser);
  const roomCode = await test.step('Host opens an online room', async () =>
    createOnlineRoom(page, context, browser, 'E2E Host'));

  const phonePage = await newPlayerPage(browser, {
    ...devices['Pixel 5'],
    // Firefox doesn't support isMobile
    isMobile: browser.browserType().name() !== 'firefox',
  });
  const phonePages = initialise(phonePage, phonePage.context(), browser);

  await test.step('The room code is typed into the remote mic "Game code" screen', async () => {
    await phonePage.goto('/?e2e-test');
    await phonePages.landingPage.joinExistingGame();
    await phonePages.joinExistingGamePage.gameCodeInput.fill(roomCode.toUpperCase());
  });

  await test.step('The phone lands in the online join flow with the code prefilled', async () => {
    await expect(phonePage).toHaveURL(new RegExp(`/online/\\?.*room=${roomCode}`));
    await expect(phonePages.onlineSetupPage.roomCodeInput).toHaveValue(roomCode);
    await expect(phonePage.getByTestId('connection-error-modal')).not.toBeVisible();
  });

  await test.step('After the name and mic steps, the phone joins the room', async () => {
    await phonePages.onlineSetupPage.submitRoomCode();
    await phonePages.onlineSetupPage.completeNameMicAndCalibrationSteps('E2E Phone');
    await phonePages.onlineLobbyPage.expectToBeVisible({ timeout: 15_000 });
    await expect(phonePages.onlineLobbyPage.participantElement(1)).toContainText('E2E Phone');
    await expect(pages.onlineLobbyPage.participantElement(1)).toContainText('E2E Phone');
  });
});
