import { expect, test } from '@playwright/test';

import { initTestMode, mockSongs, useServerOnlineMode } from './helpers';
import initialise from './page-objects/initialise';
import { createOnlineRoom } from './steps/create-online-room';
import { joinOnlineRoom } from './steps/join-online-room';
import { newPlayerPage } from './steps/new-player-page';
import { startOnlineSongAndReachLeaderboard } from './steps/start-online-song';

/**
 * The original online mode: `OnlineRoomLogic` in the PartyKit room with every client on a socket
 * to it. This is the default and the base — the `OnlineP2P` flag is what moves a room off it.
 *
 * The rest of the online suite runs P2P, since feature flags are forced on under e2e, so this is
 * what keeps the default covered. One full round is enough: both modes share the room logic and
 * the wire protocol, so what is under test here is the PartyKit room and the client's server-mode
 * transport.
 *
 * The room server is started by the webServer entry in playwright.config.ts.
 */

const song = {
  ID: 'e2e-single-english-1995',
  language: 'English',
  artist: 'Test',
  title: 'E2E',
};

const hostName = 'E2E Host';
const guestName = 'E2E Guest';

test.beforeEach(async ({ page, context }) => {
  await initTestMode({ page, context });
  await useServerOnlineMode({ page, context });
  await mockSongs({ page, context });
});

test('Online mode (server): a full round from lobby to results', async ({ page, context, browser }) => {
  test.slow();
  const pages = initialise(page, context, browser);

  const roomCode = await createOnlineRoom(page, context, browser, hostName);

  const guestPage = await newPlayerPage(browser);
  // The guest has to agree on the mode — the two keep their rooms in different places, so a
  // mismatched joiner would be told the code does not exist.
  await useServerOnlineMode({ page: guestPage, context: guestPage.context() });
  const guestPages = await joinOnlineRoom(guestPage, guestPage.context(), browser, roomCode, guestName);

  await expect(pages.onlineLobbyPage.participantElement(1)).toContainText(guestName);

  await startOnlineSongAndReachLeaderboard(page, pages, guestPages, song);

  await expect(page.getByTestId('online-results')).toBeVisible({ timeout: 60_000 });
  await expect(guestPage.getByTestId('online-results')).toBeVisible({ timeout: 60_000 });

  await guestPage.context().close();
});
