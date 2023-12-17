import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import navigateWithKeyboard from './steps/navigateWithKeyboard';

import initialise from './PageObjects/initialise';

let pages: ReturnType<typeof initialise>;
test.beforeEach(async ({ page, context, browser }) => {
  pages = initialise(page, context, browser);
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('Sing a song', async ({ page, browserName }, testInfo) => {
  test.slow();
  await page.goto('/?e2e-test');
  await pages.landingPage.enterTheGame();
  await page.getByTestId('advanced').click();
  await page.getByTestId('save-button').click();

  await page.getByTestId('sing-a-song').click();
  await expect(page.getByTestId('lang-Polish')).toBeVisible();
  await page.getByTestId('close-exclude-languages').click();

  await expect(page.getByTestId('song-e2e-single-english-1995')).toBeVisible();

  await page.keyboard.press('Enter'); // enter first song
  await expect(page.getByTestId('next-step-button')).toBeVisible();
  await page.keyboard.press(browserName === 'firefox' ? 'Backspace' : 'Escape'); // check if escape works for Chrome
  await expect(page.getByTestId('next-step-button')).not.toBeVisible();
  await navigateWithKeyboard(page, 'song-e2e-multitrack-polish-1994');

  await expect(page.getByTestId('song-e2e-multitrack-polish-1994').getByTestId('multitrack-indicator')).toBeVisible();
  await expect(page.getByTestId('song-e2e-single-english-1995').getByTestId('multitrack-indicator')).not.toBeVisible();

  await page.getByTestId('playlist-Polish').click();

  await page.keyboard.press('Enter'); // focus
  await expect(page.getByTestId('next-step-button')).toBeVisible();

  // Game mode
  await navigateWithKeyboard(page, 'game-mode-setting');
  await page.keyboard.press('Enter'); // change to duel
  await page.keyboard.press('Enter'); // change to pass the mic
  await expect(page.getByTestId('game-mode-setting')).toHaveAttribute('data-test-value', 'Pass The Mic');

  // Difficulty
  await navigateWithKeyboard(page, 'difficulty-setting');
  await page.keyboard.press('Enter'); // change to hard
  await expect(page.getByTestId('difficulty-setting')).toHaveAttribute('data-test-value', 'Hard');

  await navigateWithKeyboard(page, 'next-step-button');
  await page.keyboard.press('Enter', { delay: 40 }); // Go to next step

  // Player 1
  // Name
  await expect(page.getByTestId('player-0-name')).toBeVisible();
  await navigateWithKeyboard(page, 'player-0-name');
  await page.keyboard.press('Enter', { delay: 40 }); // activate
  await expect(page.getByTestId('player-0-name')).toBeFocused();
  await page.keyboard.type('E2E Player 1'); // enter
  await page.keyboard.press('Enter'); // save
  await expect(page.getByTestId('player-0-name')).not.toBeFocused();
  // Track
  await navigateWithKeyboard(page, 'player-0-track-setting');
  await page.keyboard.press('Enter'); // change to track 2
  await expect(page.getByTestId('player-0-track-setting')).toHaveAttribute('data-test-value', '2');

  // Player 2
  // Name
  await navigateWithKeyboard(page, 'player-1-name');
  await page.keyboard.press('Enter'); // activate
  await expect(page.getByTestId('player-1-name')).toBeFocused();
  await page.keyboard.type('E2E Player 2'); // enter
  // Track
  await navigateWithKeyboard(page, 'player-1-track-setting');
  await expect(page.getByTestId('player-1-name')).not.toBeFocused();
  await page.keyboard.press('Enter'); // change to track 1
  await expect(page.getByTestId('player-1-track-setting')).toHaveAttribute('data-test-value', '1');

  // Start song
  await navigateWithKeyboard(page, 'play-song-button');
  await page.keyboard.press('Enter');

  const p1CL = '[data-test="lyrics-current-player-0"]';
  const p1NL = '[data-test="lyrics-next-player-0"]';
  const p2CL = '[data-test="lyrics-current-player-1"]';
  const p2NL = '[data-test="lyrics-next-player-1"]';

  test.setTimeout(testInfo.timeout + 3000);

  await Promise.all(['Track 2', 'Section', '1'].map((text) => expect(page.locator(p1CL)).toContainText(text)));
  await Promise.all(['Track 2', 'Section', '2'].map((text) => expect(page.locator(p1NL)).toContainText(text)));
  await Promise.all(['Track 1', 'Section 1'].map((text) => expect(page.locator(p2CL)).toContainText(text)));
  await Promise.all(['Track 1', 'Section 2'].map((text) => expect(page.locator(p2NL)).toContainText(text)));

  await Promise.all(['Track 2', 'Section', '2'].map((text) => expect(page.locator(p1CL)).toContainText(text)));
  await Promise.all(['Track 1', 'Section 2'].map((text) => expect(page.locator(p2CL)).toContainText(text)));
  await Promise.all(['Track 2', 'Section 3'].map((text) => expect(page.locator(p1NL)).toContainText(text)));

  test.setTimeout(testInfo.timeout);

  // Song ending
  await expect(page.getByTestId('skip-animation-button')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('player-0-name')).toHaveText('E2E Player 1');
  await expect(page.getByTestId('player-1-name')).toHaveText('E2E Player 2');

  // Skip waiting for stats
  await page.getByTestId('skip-animation-button').click();
  // Highscores
  await page.getByTestId('highscores-button').click();

  await expect(page.locator('[data-test="input-edit-highscore"][data-original-name="E2E Player 1"]')).toBeVisible();
  await expect(page.locator('[data-test="input-edit-highscore"][data-original-name="E2E Player 2"]')).toBeVisible();

  // Edit a highscore name
  await page.keyboard.press('ArrowDown'); // highest score player
  await page.keyboard.type('Updated name');
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(500); // It takes 300ms to save the score

  // Check next song
  await page.getByTestId('play-next-song-button').click();
  await expect(
    page.locator('[data-test="song-e2e-multitrack-polish-1994"] >> [data-test="song-stat-indicator"]'),
  ).toContainText('Played today', { ignoreCase: true });

  // Check if the playlist is still selected
  await expect(page.getByTestId('playlist-Polish')).toHaveAttribute('data-selected', 'true');
  await expect(page.getByTestId('song-e2e-single-english-1995')).not.toBeVisible();

  // Check next song player names
  await page.keyboard.press('Enter'); // enter first song
  await expect(page.getByTestId('next-step-button')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('player-0-name')).toHaveAttribute('placeholder', 'E2E Player 1');
  await expect(page.getByTestId('player-1-name')).toHaveAttribute('placeholder', 'E2E Player 2');

  // Check if recent player list contains updated name
  await page.getByTestId('player-0-name').click();
  await expect(page.locator('role=listbox')).toContainText('Updated name');
  await page.keyboard.press('Enter');
  await page.getByTestId('play-song-button').click();

  // Check updated highscore
  await expect(page.locator(p1CL)).toBeVisible();
  await page.waitForTimeout(1000); // otherwise the click might happen before the game actually starts
  await page.locator('body').click({ force: true, position: { x: 350, y: 350 } });
  await page.getByTestId('button-resume-song').click(); // Check resume song
  await expect(page.getByTestId('button-resume-song')).not.toBeVisible();
  await page.keyboard.press('Backspace');
  await page.getByTestId('button-exit-song').click();

  // Skip waiting for stats
  await page.getByTestId('skip-animation-button').click();
  await page.getByTestId('highscores-button').click();
  await expect(page.getByTestId('highscores-container')).toContainText('Updated name');
});
