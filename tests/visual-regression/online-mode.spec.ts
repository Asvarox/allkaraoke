import { expect, Page } from '@playwright/test';

import { mockSongs } from '../helpers';
import initialise from '../page-objects/initialise';
import { joinOnlineRoom } from '../steps/join-online-room';
import { newPlayerPage } from '../steps/new-player-page';
import { visual } from './visual';

const song = {
  ID: 'e2e-single-english-1995',
  language: 'English',
};

// The room code and invite link are randomly generated per run, on both the host's and the
// guest's copy of the same lobby card
const roomCodeMasks = (targetPage: Page) => [
  targetPage.getByTestId('online-room-code'),
  targetPage.getByTestId('online-invite-link-input'),
];

// Desktop only for now — online mode isn't yet visually pinned on the narrower viewports.
visual('Online mode', ['desktop'], async ({ page, context, browser, viewport, makeScreenshot }) => {
  await mockSongs({ page, context });
  const pages = initialise(page, context, browser);

  await page.goto('/online/?e2e-test');
  await expect(pages.onlineSetupPage.createRoomButton).toBeVisible();
  await makeScreenshot('choose-create-or-join');

  await pages.onlineSetupPage.joinExistingRoomButton.click();
  await expect(pages.onlineSetupPage.roomCodeInput).toBeVisible();
  await makeScreenshot('enter-room-code');

  await pages.onlineSetupPage.goBack();
  await pages.onlineSetupPage.createRoomButton.click();
  await expect(page.getByTestId('online-name-input')).toBeVisible();
  await makeScreenshot('enter-name');

  await page.getByTestId('online-name-input').fill('E2E Host');
  await page.getByTestId('next-step-button').click();
  await page.getByTestId('save-button').click();
  await pages.calibration.approveDefaultCalibrationSetting();
  await pages.onlineLobbyPage.expectToBeVisible({ timeout: 15_000 });

  await makeScreenshot('lobby', { extraMasks: roomCodeMasks(page) });

  // Host picks a song
  await pages.onlineLobbyPage.goToSongSelection();
  await pages.songLanguagesPage.ensureSongLanguageIsSelected(song.language);
  await pages.songLanguagesPage.continueAndGoToSongList();
  await pages.songListPage.openPreviewForSong(song.ID);
  await pages.songPreviewPage.goNext();
  await page.getByTestId('play-song-button').click();
  await expect(pages.onlineLobbyPage.browsedSongTitleElement).not.toHaveText('No song yet', { timeout: 15_000 });

  await makeScreenshot('lobby-song-selected', { extraMasks: roomCodeMasks(page) });

  const roomCode = await pages.onlineLobbyPage.getRoomCode();
  const guestPage = await newPlayerPage(browser);
  await guestPage.setViewportSize(viewport);
  await guestPage.addInitScript(() => {
    Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true });
  });
  const guestPages = await joinOnlineRoom(guestPage, guestPage.context(), browser, roomCode, 'E2E Guest');
  // The guest only ever sees the lobby after the host already picked a song
  await expect(guestPages.onlineLobbyPage.browsedSongTitleElement).not.toHaveText('No song yet', {
    timeout: 15_000,
  });

  await makeScreenshot('lobby-guest-song-selected', { page: guestPage, extraMasks: roomCodeMasks(guestPage) });
  await guestPage.context().close();
});
