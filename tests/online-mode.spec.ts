import { expect, test } from '@playwright/test';

import { ONLINE_MAX_PLAYERS } from '~/modules/players/player-number';

import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';
import { createOnlineRoom } from './steps/create-online-room';
import { joinOnlineRoom } from './steps/join-online-room';
import { newPlayerPage } from './steps/new-player-page';
import { openOnlinePauseOverlay } from './steps/open-online-pause-overlay';
import { startOnlineSongAndReachLeaderboard } from './steps/start-online-song';

// The online room server (partykit dev) is started via the webServer entry in playwright.config.ts

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
  await mockSongs({ page, context });
});

test('Online mode: full game flow', async ({ page, context, browser }) => {
  test.slow();
  const pages = initialise(page, context, browser);

  await test.step('Host reaches online mode from the main menu', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await page.getByTestId('online').click();
    // the landing screen offers exactly three choices — entering a code belongs to the join flow
    await expect(pages.onlineSetupPage.createRoomButton).toBeVisible();
    await expect(pages.onlineSetupPage.joinExistingRoomButton).toBeVisible();
    await expect(pages.onlineSetupPage.backButton).toBeVisible();
    await expect(pages.onlineSetupPage.roomCodeInput).not.toBeVisible();
  });

  await test.step('Host opens a room via the name → mic → calibration wizard', async () => {
    await pages.onlineSetupPage.createRoom(hostName);
    await pages.onlineLobbyPage.expectToBeVisible({ timeout: 15_000 });
  });
  const roomCode = await pages.onlineLobbyPage.getRoomCode();

  const guestPage = await newPlayerPage(browser);
  const guestPages = initialise(guestPage, guestPage.context(), browser);

  await test.step('Guest joins by link — the code step arrives prefilled from the invite', async () => {
    await guestPages.onlineSetupPage.gotoRoomLink(roomCode);
    await expect(guestPages.onlineSetupPage.roomCodeInput).toHaveValue(roomCode);
    await guestPages.onlineSetupPage.submitRoomCode();
    await guestPages.onlineSetupPage.completeNameMicAndCalibrationSteps(guestName);
    // no extra "all set" step — the last wizard step drops the guest right into the lobby
    await guestPages.onlineLobbyPage.expectToBeVisible({ timeout: 15_000 });
  });

  await test.step('Both singers see each other, host is marked', async () => {
    await expect(pages.onlineLobbyPage.participantElement(0)).toContainText(hostName);
    await expect(pages.onlineLobbyPage.participantHostTagElement(0)).toBeVisible();
    await expect(pages.onlineLobbyPage.participantElement(1)).toContainText(guestName);

    await expect(guestPages.onlineLobbyPage.participantElement(0)).toContainText(hostName);
    await expect(guestPages.onlineLobbyPage.participantElement(1)).toContainText(guestName);
    // the guest has no song-selection controls
    await expect(guestPages.onlineLobbyPage.chooseSongButton).not.toBeVisible();
  });

  await test.step('The song browser is its own history entry — back returns to the lobby', async () => {
    await pages.onlineLobbyPage.goToSongSelection();
    // the language step only shows on the first visit, so it's taken here rather than below
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(song.language);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.onlineLobbyPage.expectNotToBeVisible();
    await expect(page).toHaveURL(/\/online\/pick-song\//);
    await page.goBack();
    await pages.onlineLobbyPage.expectToBeVisible();
  });

  await test.step('Host browses songs — everyone sees what they hover, with mode and difficulty', async () => {
    await pages.onlineLobbyPage.goToSongSelection();
    await pages.songListPage.openPreviewForSong(song.ID);

    // the other singers get a song-card-like preview with the video and details
    await expect(guestPages.onlineLobbyPage.browsedSongArtistElement).toHaveText(song.artist);
    await expect(guestPages.onlineLobbyPage.browsedSongTitleElement).toHaveText(song.title);
    // online play is Duel-only; the host's difficulty is visible to everyone
    await expect(guestPages.onlineLobbyPage.browsedSongDetailsElement).toContainText('Duel');
    await pages.songPreviewPage.expectGameModeToBe('Duel');
  });

  await test.step('Guests can react to the browsed song — the host sees the votes', async () => {
    // the singer's lobby puts the keyboard on the vote, not on leaving the room
    await expect(guestPages.onlineLobbyPage.voteUpButton).toHaveAttribute('data-focused', 'true');
    await guestPages.onlineLobbyPage.voteUp();
    await expect(pages.onlineLobbyPage.songPlayerElement(1)).toHaveAttribute('data-vote', 'up');
    await expect(pages.onlineLobbyPage.songPlayerElement(1)).toContainText(guestName);
  });

  await test.step('Host selects the song — the chart is transferred to everyone', async () => {
    await pages.songPreviewPage.goNext();
    await page.getByTestId('play-song-button').click();

    // the selected song heads the lobby (and stays previewable) for everyone
    await expect(pages.onlineLobbyPage.browsedSongTitleElement).toHaveText(song.title, { timeout: 15_000 });
    await expect(pages.onlineLobbyPage.browsedSongArtistElement).toHaveText(song.artist);
    await expect(guestPages.onlineLobbyPage.browsedSongTitleElement).toHaveText(song.title);
    await expect(guestPages.onlineLobbyPage.browsedSongArtistElement).toHaveText(song.artist);
    // voting stays open after the pick (the votes themselves reset with the new song), and the host
    // sees the reaction right on the singer's row
    await guestPages.onlineLobbyPage.voteUp();
    await expect(pages.onlineLobbyPage.participantElement(1)).toHaveAttribute('data-vote', 'up');
    await expect(pages.onlineLobbyPage.chooseSongButton).toBeVisible();
  });

  await test.step('The host starts the song — everyone confirms readiness with the video loaded', async () => {
    // No one else has to agree first: the guest has no start control at all
    await expect(guestPages.onlineLobbyPage.startSongButton).not.toBeVisible();
    await pages.onlineLobbyPage.startSong();

    // Both are taken to the song screen, held on the readiness confirmation
    await expect(page.getByTestId('online-readiness')).toBeVisible({ timeout: 15_000 });
    await expect(guestPage.getByTestId('online-readiness')).toBeVisible({ timeout: 15_000 });
    // …showing every singer and who has confirmed so far
    await expect(page.getByTestId('online-readiness-0')).toContainText(hostName);
    await expect(page.getByTestId('online-readiness-1')).toContainText(guestName);

    await page.getByTestId('online-ready-button').click();
    await expect(guestPage.getByTestId('online-readiness-0')).toHaveAttribute('data-confirmed', 'true');
    // One singer confirming isn't enough — the song is still held
    await expect(guestPage.getByTestId('online-readiness')).toBeVisible();
    await guestPage.getByTestId('online-ready-button').click();
  });

  await test.step('Singing starts with a live leaderboard for both singers', async () => {
    await expect(guestPage.getByTestId('online-readiness')).not.toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('online-leaderboard')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('online-leaderboard-entry-0')).toContainText(hostName);
    await expect(page.getByTestId('online-leaderboard-entry-1')).toContainText(guestName);
    await expect(guestPage.getByTestId('online-leaderboard')).toBeVisible();
  });

  await test.step('Any singer can pause — it pauses everyone; any singer can resume', async () => {
    await openOnlinePauseOverlay(guestPage, page);
    await expect(page.getByTestId('online-pause-overlay')).toContainText(guestName);
    await expect(guestPage.getByTestId('online-pause-overlay')).toBeVisible();

    // the host (not the pauser) resumes
    await page.getByTestId('online-resume-button').click();
    await expect(page.getByTestId('online-pause-overlay')).not.toBeVisible({
      timeout: 10_000,
    });
    await expect(guestPage.getByTestId('online-pause-overlay')).not.toBeVisible({ timeout: 10_000 });
  });

  await test.step('Final screen shows the result breakdown for all singers', async () => {
    await expect(page.getByTestId('online-results')).toBeVisible({
      timeout: 60_000,
    });
    await expect(guestPage.getByTestId('online-results')).toBeVisible({
      timeout: 30_000,
    });

    await expect(page.getByTestId('player-0-name')).toHaveText(hostName);
    await expect(page.getByTestId('player-1-name')).toHaveText(guestName);
    await expect(guestPage.getByTestId('player-0-name')).toHaveText(hostName);
  });

  await test.step('No high-scores step — Next returns everyone to the lobby', async () => {
    await page.getByTestId('skip-animation-button').click();
    await page.getByTestId('highscores-button').click();
    await pages.onlineLobbyPage.expectToBeVisible({ timeout: 10_000 });
    await guestPages.onlineLobbyPage.expectToBeVisible({ timeout: 10_000 });
    // the finished song is no longer selected — the next round starts fresh
    await expect(pages.onlineLobbyPage.selectedSongElement).toContainText('Pick a song');
    await expect(pages.onlineLobbyPage.startSongButton).not.toBeVisible();
  });

  await test.step('Leaving the room takes a confirmation', async () => {
    await guestPages.onlineLobbyPage.leaveRoomAndCancel();
    await guestPages.onlineLobbyPage.expectToBeVisible();

    await guestPages.onlineLobbyPage.leaveRoomAndConfirm();
    await guestPages.onlineLobbyPage.expectNotToBeVisible();
  });

  await guestPage.context().close();
});

test('Online mode: the host ends the song from the pause menu', async ({ page, context, browser }) => {
  test.slow();
  const pages = initialise(page, context, browser);

  const roomCode = await createOnlineRoom(page, context, browser, hostName);

  const guestPage = await newPlayerPage(browser);
  const guestPages = await joinOnlineRoom(guestPage, guestPage.context(), browser, roomCode, guestName);

  await test.step('Host picks a song and starts it', async () => {
    await startOnlineSongAndReachLeaderboard(page, pages, guestPages, song);
  });

  await test.step('Ending the game mid-song takes everyone to the results, not a stuck screen', async () => {
    await openOnlinePauseOverlay(page);

    await page.getByTestId('online-end-game-button').click();
    await page.getByTestId('online-end-game-confirm-modal').getByRole('button', { name: 'End game' }).click();

    // The screen the game was ended from has to go: it's the pause menu of a song that no longer runs
    await expect(page.getByTestId('online-pause-overlay')).not.toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('online-results')).toBeVisible({ timeout: 30_000 });
    await expect(guestPage.getByTestId('online-results')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('player-0-name')).toHaveText(hostName);
  });

  await guestPage.context().close();
});

test('Online mode: a host alone in the room is offered local mode instead of a start', async ({
  page,
  context,
  browser,
}) => {
  test.slow();
  const pages = initialise(page, context, browser);

  await createOnlineRoom(page, context, browser, hostName);
  await expect(pages.onlineLobbyPage.needsMoreSingersElement).toBeVisible();

  await test.step('Host picks a song, but starting it offers local mode instead', async () => {
    await pages.onlineLobbyPage.goToSongSelection();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(song.language);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.openPreviewForSong(song.ID);
    await pages.songPreviewPage.goNext();
    await pages.songPreviewPage.pickSongForTheRoom();

    await expect(pages.onlineLobbyPage.startSongButton).toBeVisible({ timeout: 15_000 });
    await pages.onlineLobbyPage.startSongAndDismissSoloPrompt();
    // Staying keeps the room exactly as it was — no readiness screen, no song
    await pages.onlineLobbyPage.expectToBeVisible();
  });

  await test.step('Once a second singer joins, the same button starts the song', async () => {
    const roomCode = await pages.onlineLobbyPage.getRoomCode();
    const guestPage = await newPlayerPage(browser);
    const guestPages = await joinOnlineRoom(guestPage, guestPage.context(), browser, roomCode, guestName);

    await expect(pages.onlineLobbyPage.needsMoreSingersElement).not.toBeVisible();
    await pages.onlineLobbyPage.startSong();
    await pages.onlineSingingPage.confirmReady();
    await guestPages.onlineSingingPage.confirmReady();
    await pages.onlineSingingPage.expectLeaderboardToBeVisible({ timeout: 15_000 });

    await guestPage.context().close();
  });
});

test('Online mode: a lone host taking local mode lands on the song the room had picked', async ({
  page,
  context,
  browser,
}) => {
  test.slow();
  const pages = initialise(page, context, browser);

  await createOnlineRoom(page, context, browser, hostName);
  await pages.onlineLobbyPage.goToSongSelection();
  await pages.songLanguagesPage.ensureSongLanguageIsSelected(song.language);
  await pages.songLanguagesPage.continueAndGoToSongList();
  await pages.songListPage.openPreviewForSong(song.ID);
  await pages.songPreviewPage.goNext();
  await pages.songPreviewPage.pickSongForTheRoom();
  await expect(pages.onlineLobbyPage.startSongButton).toBeVisible({ timeout: 15_000 });

  await pages.onlineLobbyPage.startSongAndSingLocally();

  // The local song list opens focused on the room's pick, and the room code is left behind
  await pages.songListPage.expectSelectedSongToBe(song.ID);
  expect(new URL(page.url()).searchParams.get('song')).toBe(song.ID);
  expect(new URL(page.url()).searchParams.get('room')).toBeNull();
});

test('Online mode: host can kick a singer, who cannot rejoin', async ({ page, context, browser }) => {
  test.slow();
  const pages = initialise(page, context, browser);

  const roomCode = await createOnlineRoom(page, context, browser, hostName);

  const guestPage = await newPlayerPage(browser);
  const guestPages = await joinOnlineRoom(guestPage, guestPage.context(), browser, roomCode, guestName);
  await expect(pages.onlineLobbyPage.participantElement(1)).toContainText(guestName);

  await test.step('Host kicks the guest from the lobby, with a confirmation', async () => {
    await pages.onlineLobbyPage.kickParticipant(1);
    await expect(pages.onlineLobbyPage.participantElement(1)).not.toBeVisible();
    await expect(guestPages.onlineSetupPage.joinRejectedElement).toBeVisible({
      timeout: 15_000,
    });
    await expect(guestPages.onlineSetupPage.joinRejectedElement).toContainText('removed from this room');
  });

  await test.step('The kicked singer cannot rejoin by entering the code again', async () => {
    await guestPages.onlineSetupPage.goBack();
    // the name and calibration are remembered by now, so only the code and mic steps remain
    await guestPages.onlineSetupPage.joinRoomByCode(roomCode);
    await guestPages.onlineSetupPage.completeNameMicAndCalibrationSteps(guestName, {
      nameStep: false,
      calibrationStep: false,
    });
    await expect(guestPages.onlineSetupPage.joinRejectedElement).toBeVisible({
      timeout: 15_000,
    });
    await expect(guestPages.onlineSetupPage.joinRejectedElement).toContainText('removed from this room');
  });

  await guestPage.context().close();
});

test('Online mode: join by code, host disconnect promotes the next-joined singer', async ({
  page,
  context,
  browser,
}) => {
  test.slow();

  const roomCode = await createOnlineRoom(page, context, browser, hostName);

  const guestPage = await newPlayerPage(browser);
  const guestPages = initialise(guestPage, guestPage.context(), browser);

  await test.step('Joining a room code that does not exist is rejected upfront', async () => {
    await guestPages.onlineSetupPage.goto();
    await guestPages.onlineSetupPage.joinRoomByCode('zzzzz');
    await expect(guestPage.getByText('This room does not exist')).toBeVisible();
  });

  await test.step('Guest joins by entering the room code in the wizard', async () => {
    await guestPages.onlineSetupPage.roomCodeInput.fill(roomCode);
    await guestPages.onlineSetupPage.submitRoomCode();
    await guestPages.onlineSetupPage.completeNameMicAndCalibrationSteps(guestName);
    await guestPages.onlineLobbyPage.expectToBeVisible({ timeout: 15_000 });
    await expect(guestPages.onlineLobbyPage.participantElement(0)).toContainText(hostName);
    await expect(guestPages.onlineLobbyPage.participantElement(1)).toContainText(guestName);
  });

  await test.step('Guest changes their color via the customize modal', async () => {
    await guestPages.onlineLobbyPage.openCustomizeModal();
    // picking a color applies it and closes the modal — there's nothing left to confirm
    await guestPages.onlineLobbyPage.pickColor(3);
    await expect(guestPages.onlineLobbyPage.customizeModalElement).not.toBeVisible();
    // the guest now occupies the picked color's slot, visible to everyone
    await expect(guestPages.onlineLobbyPage.participantElement(3)).toContainText(guestName);
    await expect(guestPages.onlineLobbyPage.participantElement(1)).not.toBeVisible();
  });

  await test.step('Host disconnects — after the grace period the guest becomes host', async () => {
    await page.close();
    // the disconnect is visible immediately…
    await expect(guestPages.onlineLobbyPage.participantElement(0)).toHaveAttribute('data-connected', 'false', {
      timeout: 10_000,
    });
    // …and after the reconnect grace period the spot is freed and the host role moves on
    await expect(guestPages.onlineLobbyPage.participantElement(0)).not.toBeVisible({ timeout: 30_000 });
    await expect(guestPages.onlineLobbyPage.participantHostTagElement(3)).toBeVisible();
    // the new host can select the song now
    await expect(guestPages.onlineLobbyPage.chooseSongButton).toBeVisible();
  });

  await guestPage.context().close();
});

test('Online mode: a full room rejects the next joiner', async ({ page, context, browser }) => {
  test.slow();
  const pages = initialise(page, context, browser);

  const roomCode = await createOnlineRoom(page, context, browser, hostName);

  // Fill every remaining seat with a bare WebSocket connection straight to the partykit room —
  // the same `pid`/`name` query-string join the real client uses (see online-client.ts), just
  // without the browser tab, React app or fake mic stream around it. Five *real* guest tabs each
  // holding a live fake-audio capture reliably deadlocks Chromium's fake-audio backend, so seats
  // are filled at the protocol level here and only the final, rejected join goes through the
  // real UI — which is the part actually under test.
  const fillerSockets: WebSocket[] = [];
  try {
    for (let seat = 1; seat < ONLINE_MAX_PLAYERS; seat++) {
      const socket = new WebSocket(
        `ws://localhost:1999/party/${roomCode}?pid=${crypto.randomUUID()}&name=Filler+${seat}`,
      );
      fillerSockets.push(socket);
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Filler socket ${seat} timed out joining`)), 10_000);
        socket.addEventListener('message', (event) => {
          const message = JSON.parse(event.data.toString());
          if (message.t === 'joined') {
            clearTimeout(timer);
            resolve();
          }
        });
        socket.addEventListener('error', () => {
          clearTimeout(timer);
          reject(new Error(`Filler socket ${seat} failed to join`));
        });
        socket.addEventListener('close', () => {
          clearTimeout(timer);
          reject(new Error(`Filler socket ${seat} closed before joining`));
        });
      });
    }
    await expect(pages.onlineLobbyPage.participantElement(ONLINE_MAX_PLAYERS - 1)).toBeVisible();

    await test.step('The room is at capacity — the next singer is turned away after the wizard, not before', async () => {
      const overflowPage = await newPlayerPage(browser);
      const overflowPages = initialise(overflowPage, overflowPage.context(), browser);
      await overflowPages.onlineSetupPage.gotoRoomLink(roomCode);
      // The code itself is valid — it's the seat count that fails, so this passes
      await overflowPages.onlineSetupPage.submitRoomCode();
      await overflowPages.onlineSetupPage.completeNameMicAndCalibrationSteps('Overflow Singer');
      await expect(overflowPages.onlineSetupPage.joinRejectedElement).toBeVisible({ timeout: 15_000 });
      await expect(overflowPages.onlineSetupPage.joinRejectedElement).toContainText('full');
      await overflowPage.context().close();
    });
  } finally {
    fillerSockets.forEach((socket) => socket.close());
  }
});

test('Online mode: a guest refreshing mid-song reconnects into the same running game', async ({
  page,
  context,
  browser,
}) => {
  test.slow();
  const pages = initialise(page, context, browser);

  const roomCode = await createOnlineRoom(page, context, browser, hostName);

  const guestPage = await newPlayerPage(browser);
  const guestPages = await joinOnlineRoom(guestPage, guestPage.context(), browser, roomCode, guestName);

  await startOnlineSongAndReachLeaderboard(page, pages, guestPages, song);

  await test.step('Guest refreshes mid-song — they land straight back in the running game, no setup wizard', async () => {
    await guestPage.reload();
    await expect(guestPages.onlineLobbyPage.lobbyElement.or(guestPage.getByTestId('online-leaderboard'))).toBeVisible({
      timeout: 15_000,
    });
    // Not bounced back to name/mic/calibration — the session remembers it already finished the wizard
    await expect(guestPages.onlineSetupPage.createRoomButton).not.toBeVisible();
  });

  await test.step('The host was unaffected the whole time and the round still finishes for both', async () => {
    await expect(page.getByTestId('online-results')).toBeVisible({ timeout: 60_000 });
    await expect(guestPage.getByTestId('online-results')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('player-0-name')).toHaveText(hostName);
  });

  await guestPage.context().close();
});

test('Online mode: host closing the tab mid-song still lets the round finish and promotes the guest', async ({
  page,
  context,
  browser,
}) => {
  test.slow();
  const pages = initialise(page, context, browser);

  const roomCode = await createOnlineRoom(page, context, browser, hostName);

  const guestPage = await newPlayerPage(browser);
  const guestPages = await joinOnlineRoom(guestPage, guestPage.context(), browser, roomCode, guestName);

  await startOnlineSongAndReachLeaderboard(page, pages, guestPages, song);

  await test.step('Host closes the tab entirely mid-song — the guest is left to finish the round alone', async () => {
    await page.close();
    await expect(guestPage.getByTestId('online-results')).toBeVisible({ timeout: 60_000 });
    await expect(guestPage.getByTestId('player-1-name')).toHaveText(guestName);
  });

  await test.step('Back at the lobby, the grace period has expired and the guest is now host', async () => {
    await guestPage.getByTestId('skip-animation-button').click();
    await guestPage.getByTestId('highscores-button').click();
    await guestPages.onlineLobbyPage.expectToBeVisible({ timeout: 10_000 });
    await expect(guestPages.onlineLobbyPage.participantElement(0)).not.toBeVisible({ timeout: 30_000 });
    await expect(guestPages.onlineLobbyPage.participantHostTagElement(1)).toBeVisible();
    await expect(guestPages.onlineLobbyPage.chooseSongButton).toBeVisible();
  });

  await guestPage.context().close();
});
