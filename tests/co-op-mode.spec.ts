import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import navigateWithKeyboard from './steps/navigateWithKeyboard';

test.beforeEach(async ({ page, context }) => {
  await initTestMode({ page, context });
  await mockSongs({ page, context });
});

test('Cooperation mode', async ({ page, browserName }, testInfo) => {
  test.slow();
  await page.goto('/?e2e-test');
  await page.getByTestId('enter-the-game').click();
  await page.getByTestId('advanced').click();
  await page.getByTestId('save-button').click();

  await page.getByTestId('sing-a-song').click();
  await expect(page.getByTestId('lang-Polish')).toBeVisible();
  await page.getByTestId('close-exclude-languages').click();

  await expect(page.getByTestId('song-e2e-single-english-1995')).toBeVisible();
  await navigateWithKeyboard(page, 'song-e2e-multitrack-polish-1994');

  await page.keyboard.press('Enter'); // focus
  await expect(page.getByTestId('next-step-button')).toBeVisible();

  // Game mode
  await expect(page.getByTestId('game-mode-setting')).toHaveAttribute('data-test-value', 'Cooperation');

  await navigateWithKeyboard(page, 'next-step-button');
  await page.keyboard.press('Enter', { delay: 40 }); // Go to next step

  // Start song
  await navigateWithKeyboard(page, 'play-song-button');
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('players-score')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('player-0-score')).not.toBeVisible();
  await expect(page.getByTestId('player-1-score')).not.toBeVisible();
  await expect(page.getByTestId('skip-animation-button')).toBeVisible({
    timeout: 30_000,
  });

  await expect(page.getByTestId('player-0-name')).toHaveText('Player #1, Player #2');
  await expect(page.getByTestId('player-1-name')).not.toBeVisible();

  await expect(async () => {
    const p1score = await page.getByTestId('player-0-score').getAttribute('data-score');

    expect(parseInt(p1score!, 10)).toBeGreaterThan(100);
  }).toPass();

  // High scores
  await page.getByTestId('skip-animation-button').click();
  await page.getByTestId('highscores-button').click();

  await expect(
    page.locator('[data-test="input-edit-highscore"][data-original-name="Player #1, Player #2"]'),
  ).toBeVisible();
});
