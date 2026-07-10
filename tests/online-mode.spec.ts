import { Browser, expect, Page, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import initialise from './page-objects/initialise';

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

const approveDefaultCalibration = async (page: Page) => {
  await page.getByTestId('continue').click();
  await page.getByTestId('save').click();
};

const readyUp = async (page: Page, { calibrate = false } = {}) => {
  await page.getByTestId('online-ready-button').click();
  if (calibrate) {
    await approveDefaultCalibration(page);
  }
};

/** Steps 2 (name) and 3 (mic) of the wizard — the room choice (step 1) is done by the caller. */
const completeNameAndMicSteps = async (page: Page, name: string) => {
  await page.getByTestId('online-name-input').fill(name);
  await page.getByTestId('next-step-button').click();
  // Mic setup step — the default (fake) microphone is auto-selected
  await page.getByTestId('save-button').click();
};

const openGuestPage = async (browser: Browser) => {
  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await initTestMode({ page: guestPage, context: guestContext });
  await mockSongs({ page: guestPage, context: guestContext });
  return guestPage;
};

const createRoom = async (page: Page, name: string) => {
  await page.goto('/online/?e2e-test');
  await page.getByTestId('create-room-button').click();
  await completeNameAndMicSteps(page, name);
  await expect(page.getByTestId('online-lobby-header')).toBeVisible({ timeout: 15_000 });
  const roomCode = new URL(page.url()).searchParams.get('room');
  expect(roomCode).toBeTruthy();
  return roomCode!;
};

test('Online mode: full game flow', async ({ page, context, browser }) => {
  test.slow();
  const pages = initialise(page, context, browser);

  await test.step('Host reaches online mode from the main menu', async () => {
    await page.goto('/?e2e-test');
    await pages.landingPage.enterTheGame();
    await page.getByTestId('online').click();
    // the wizard starts with the open/join step
    await expect(page.getByTestId('create-room-button')).toBeVisible();
  });

  await test.step('Host opens a room via the room → name → mic wizard', async () => {
    await page.getByTestId('create-room-button').click();
    await completeNameAndMicSteps(page, hostName);
    await expect(page.getByTestId('online-lobby-header')).toBeVisible({ timeout: 15_000 });
  });
  const roomCode = new URL(page.url()).searchParams.get('room')!;

  const guestPage = await openGuestPage(browser);

  await test.step('Guest joins by link — straight into the room after name + mic setup', async () => {
    await guestPage.goto(`/online/?room=${roomCode}&e2e-test`);
    await guestPage.getByTestId('join-room-button').click();
    await completeNameAndMicSteps(guestPage, guestName);
    // no extra "all set" step — mic setup drops the guest right into the lobby
    await expect(guestPage.getByTestId('online-lobby-header')).toBeVisible({ timeout: 15_000 });
  });

  await test.step('Both singers see each other, host is marked', async () => {
    const hostEntry = page.getByTestId('online-participant-0');
    await expect(hostEntry).toContainText(hostName);
    await expect(hostEntry.getByTestId('participant-host')).toBeVisible();
    await expect(page.getByTestId('online-participant-1')).toContainText(guestName);

    await expect(guestPage.getByTestId('online-participant-0')).toContainText(hostName);
    await expect(guestPage.getByTestId('online-participant-1')).toContainText(guestName);
    // the guest has no song-selection controls
    await expect(guestPage.getByTestId('choose-song-button')).not.toBeVisible();
  });

  await test.step('Host browses songs — everyone sees what they hover, with mode and difficulty', async () => {
    await page.getByTestId('choose-song-button').click();
    await pages.songLanguagesPage.ensureSongLanguageIsSelected(song.language);
    await pages.songLanguagesPage.continueAndGoToSongList();
    await pages.songListPage.openPreviewForSong(song.ID);

    // the other singers get a song-card-like preview with the video and details
    await expect(guestPage.getByTestId('online-host-browsing-artist')).toHaveText(song.artist);
    await expect(guestPage.getByTestId('online-host-browsing-title')).toHaveText(song.title);
    // online play is Duel-only; the host's difficulty is visible to everyone
    await expect(guestPage.getByTestId('online-host-browsing-details')).toContainText('Duel');
    await expect(page.getByTestId('game-mode-setting')).toHaveAttribute('data-test-value', 'Duel');
  });

  await test.step('Guests can react to the browsed song — the host sees the votes', async () => {
    await guestPage.getByTestId('online-vote-up').click();
    await expect(page.getByTestId('online-song-player-1')).toHaveAttribute('data-vote', 'up');
    await expect(page.getByTestId('online-song-player-1')).toContainText(guestName);
  });

  await test.step('Host selects the song — the chart is transferred to everyone', async () => {
    await pages.songPreviewPage.goNext();
    await page.getByTestId('play-song-button').click();

    await expect(page.getByTestId('online-selected-song')).toContainText(`${song.artist} - ${song.title}`, {
      timeout: 15_000,
    });
    await expect(guestPage.getByTestId('online-selected-song')).toContainText(`${song.artist} - ${song.title}`);
    // the selected song stays visible (and previewable) as a card for everyone
    await expect(guestPage.getByTestId('online-host-browsing-title')).toHaveText(song.title);
    await expect(page.getByTestId('online-host-browsing-title')).toHaveText(song.title);
  });

  await test.step('Everyone readies up (with one-time calibration) — countdown starts', async () => {
    await readyUp(page, { calibrate: true });
    await expect(page.getByTestId('online-participant-0').getByTestId('participant-ready')).toBeVisible();
    await readyUp(guestPage, { calibrate: true });

    // all ready + all playback probes pass → synchronized countdown on both screens
    await expect(page.getByTestId('online-countdown')).toBeVisible({ timeout: 15_000 });
    await expect(guestPage.getByTestId('online-countdown')).toBeVisible({ timeout: 15_000 });
  });

  await test.step('Singing starts with a live leaderboard for both singers', async () => {
    await expect(guestPage.getByTestId('online-countdown')).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('online-leaderboard')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('online-leaderboard-entry-0')).toContainText(hostName);
    await expect(page.getByTestId('online-leaderboard-entry-1')).toContainText(guestName);
    await expect(guestPage.getByTestId('online-leaderboard')).toBeVisible();
  });

  await test.step('Any singer can pause — it pauses everyone; any singer can resume', async () => {
    // In Firefox the first Escape sometimes isn't registered by the game — retry until paused
    await expect(async () => {
      if (!(await guestPage.getByTestId('online-pause-overlay').isVisible())) {
        await guestPage.keyboard.press('Escape');
      }
      await expect(page.getByTestId('online-pause-overlay')).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 20_000 });
    await expect(page.getByTestId('online-pause-overlay')).toContainText(guestName);
    await expect(guestPage.getByTestId('online-pause-overlay')).toBeVisible();

    // the host (not the pauser) resumes
    await page.getByTestId('online-resume-button').click();
    await expect(page.getByTestId('online-pause-overlay')).not.toBeVisible({ timeout: 10_000 });
    await expect(guestPage.getByTestId('online-pause-overlay')).not.toBeVisible({ timeout: 10_000 });
  });

  await test.step('Final screen shows the result breakdown for all singers', async () => {
    await expect(page.getByTestId('online-results')).toBeVisible({ timeout: 60_000 });
    await expect(guestPage.getByTestId('online-results')).toBeVisible({ timeout: 30_000 });

    await expect(page.getByTestId('player-0-name')).toHaveText(hostName);
    await expect(page.getByTestId('player-1-name')).toHaveText(guestName);
    await expect(guestPage.getByTestId('player-0-name')).toHaveText(hostName);
  });

  await test.step('No high-scores step — Next returns everyone to the lobby', async () => {
    await page.getByTestId('skip-animation-button').click();
    await page.getByTestId('highscores-button').click();
    await expect(page.getByTestId('online-lobby-header')).toBeVisible({ timeout: 10_000 });
    await expect(guestPage.getByTestId('online-lobby-header')).toBeVisible({ timeout: 10_000 });
    // the finished song is no longer selected — the next round starts fresh
    await expect(page.getByTestId('online-selected-song')).not.toContainText(`${song.artist} - ${song.title}`);
    await expect(page.getByTestId('online-selected-song')).toContainText('Pick a song');
  });

  await guestPage.context().close();
});

test('Online mode: host can kick a singer, who cannot rejoin', async ({ page, browser }) => {
  test.slow();

  const roomCode = await createRoom(page, hostName);

  const guestPage = await openGuestPage(browser);
  await guestPage.goto(`/online/?room=${roomCode}&e2e-test`);
  await guestPage.getByTestId('join-room-button').click();
  await completeNameAndMicSteps(guestPage, guestName);
  await expect(guestPage.getByTestId('online-lobby-header')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('online-participant-1')).toContainText(guestName);

  await test.step('Host kicks the guest from the lobby, with a confirmation', async () => {
    await page.getByTestId('online-kick-1').click();
    await page.getByTestId('online-kick-confirm-modal').getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByTestId('online-participant-1')).not.toBeVisible();
    await expect(guestPage.getByTestId('online-join-rejected')).toBeVisible({ timeout: 15_000 });
    await expect(guestPage.getByTestId('online-join-rejected')).toContainText('removed from this room');
  });

  await test.step('The kicked singer cannot rejoin by entering the code again', async () => {
    await guestPage.getByTestId('back-button').click();
    await guestPage.getByTestId('join-room-code-input').fill(roomCode);
    await guestPage.getByTestId('join-room-button').click();
    await completeNameAndMicSteps(guestPage, guestName);
    await expect(guestPage.getByTestId('online-join-rejected')).toBeVisible({ timeout: 15_000 });
    await expect(guestPage.getByTestId('online-join-rejected')).toContainText('removed from this room');
  });

  await guestPage.context().close();
});

test('Online mode: join by code, host disconnect promotes the next-joined singer', async ({ page, browser }) => {
  test.slow();

  const roomCode = await createRoom(page, hostName);

  const guestPage = await openGuestPage(browser);

  await test.step('Joining a room code that does not exist is rejected upfront', async () => {
    await guestPage.goto('/online/?e2e-test');
    await guestPage.getByTestId('join-room-code-input').fill('zzzzz');
    await guestPage.getByTestId('join-room-button').click();
    await expect(guestPage.getByText('This room does not exist')).toBeVisible();
  });

  await test.step('Guest joins by entering the room code in the wizard', async () => {
    await guestPage.getByTestId('join-room-code-input').fill(roomCode);
    await guestPage.getByTestId('join-room-button').click();
    await completeNameAndMicSteps(guestPage, guestName);
    await expect(guestPage.getByTestId('online-lobby-header')).toBeVisible({ timeout: 15_000 });
    await expect(guestPage.getByTestId('online-participant-0')).toContainText(hostName);
    await expect(guestPage.getByTestId('online-participant-1')).toContainText(guestName);
  });

  await test.step('Guest changes their color via the customize modal', async () => {
    await guestPage.getByTestId('customize-button').click();
    await guestPage.getByTestId('online-color-3').click();
    await expect(guestPage.getByTestId('online-color-3')).toHaveAttribute('data-selected', 'true');
    await guestPage.getByTestId('customize-done-button').click();
    // the guest now occupies the picked color's slot, visible to everyone
    await expect(guestPage.getByTestId('online-participant-3')).toContainText(guestName);
    await expect(guestPage.getByTestId('online-participant-1')).not.toBeVisible();
  });

  await test.step('Host disconnects — after the grace period the guest becomes host', async () => {
    await page.close();
    // the disconnect is visible immediately…
    await expect(guestPage.getByTestId('online-participant-0')).toHaveAttribute('data-connected', 'false', {
      timeout: 10_000,
    });
    // …and after the reconnect grace period the spot is freed and the host role moves on
    await expect(guestPage.getByTestId('online-participant-0')).not.toBeVisible({ timeout: 30_000 });
    await expect(guestPage.getByTestId('online-participant-3').getByTestId('participant-host')).toBeVisible();
    // the new host can select the song now
    await expect(guestPage.getByTestId('choose-song-button')).toBeVisible();
  });

  await guestPage.context().close();
});
