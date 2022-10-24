import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('Basic sing a song', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-test="sing-a-song"]').click({ force: true });

    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();

    await page.keyboard.press('Enter'); // enter first song
    await expect(page.locator('[data-test="next-step-button"]')).toBeVisible();
    await page.keyboard.press('Backspace'); // escape
    await expect(page.locator('[data-test="next-step-button"]')).not.toBeVisible();
    await page.keyboard.press('ArrowRight'); // next song
    await page.keyboard.press('Enter'); // focus
    await expect(page.locator('[data-test="next-step-button"]')).toBeVisible();

    // Game mode
    await page.keyboard.press('ArrowUp'); // game mode
    await page.keyboard.press('Enter'); // change to pass the mic
    await expect(page.locator('[data-test="game-mode-setting"]')).toHaveAttribute('data-test-value', 'Pass The Mic');

    // Difficulty
    await page.keyboard.press('ArrowUp'); // difficulty
    await page.keyboard.press('Enter'); // change to hard
    await expect(page.locator('[data-test="difficulty-setting"]')).toHaveAttribute('data-test-value', 'Hard');

    await page.keyboard.press('ArrowUp'); // Next step button
    await page.keyboard.press('Enter', { delay: 40 }); // Go to next step

    // Player 1
    // Name
    await expect(page.locator('[data-test="player-1-name"]')).toBeVisible();
    await page.keyboard.press('ArrowDown', { delay: 40 }); // player 1 name
    await page.keyboard.press('Enter', { delay: 40 }); // activate
    await expect(page.locator('[data-test="player-1-name"]')).toBeFocused();
    await page.keyboard.type('E2E Player 1'); // enter
    await page.keyboard.press('Enter'); // save
    await expect(page.locator('[data-test="player-1-name"]')).not.toBeFocused();
    // Track
    await page.keyboard.press('ArrowDown'); // player 1 track
    await page.keyboard.press('Enter'); // change to track 2
    await expect(page.locator('[data-test="player-1-track-setting"]')).toHaveAttribute('data-test-value', '2');

    // Player 2
    // Name
    await page.keyboard.press('ArrowDown'); // player 2 name
    await page.keyboard.press('Enter'); // activate
    await expect(page.locator('[data-test="player-2-name"]')).toBeFocused();
    await page.keyboard.type('E2E Player 2'); // enter
    // Track
    await page.keyboard.press('ArrowDown'); // player 2 track
    await expect(page.locator('[data-test="player-2-name"]')).not.toBeFocused();
    await page.keyboard.press('Enter'); // change to track 1
    await expect(page.locator('[data-test="player-2-track-setting"]')).toHaveAttribute('data-test-value', '1');

    // Start song
    await page.keyboard.press('ArrowDown');

    await page.keyboard.press('Enter');

    // Song ending
    await expect(page.locator('[data-test="highscores-button"]')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('[data-test="player-1-name"]')).toHaveText('E2E Player 1');
    await expect(page.locator('[data-test="player-2-name"]')).toHaveText('E2E Player 2');

    // High scores
    await page.locator('[data-test="highscores-button"]').click({ force: true });

    await expect(page.locator('[data-test="highscores-container"]')).toContainText('E2E Player 1');
    await expect(page.locator('[data-test="highscores-container"]')).toContainText('E2E Player 2');

    // Check next song
    await page.locator('[data-test="play-next-song-button"]').click({ force: true });
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(
        page.locator('[data-test="song-e2e-test-multitrack.json"] >> [data-test="song-stat-indicator"]'),
    ).toContainText('Played today', { ignoreCase: true });

    // Check next song player names
    await page.keyboard.press('Enter'); // enter first song
    await expect(page.locator('[data-test="next-step-button"]')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-test="player-1-name"]')).toHaveAttribute('placeholder', 'E2E Player 1');
    await expect(page.locator('[data-test="player-2-name"]')).toHaveAttribute('placeholder', 'E2E Player 2');
});

test('skip the intro', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-test="sing-a-song"]').click({ force: true });
    await expect(page.locator('[data-test="song-preview"]')).toHaveAttribute('data-song', 'e2e-skip-intro-song.json');
    await page.keyboard.press('Enter'); // enter first song

    await page.locator('[data-test="skip-intro"]').click({ force: true });
    await expect(page.locator('[data-test="skip-intro"]')).toHaveAttribute('data-test-value', 'true');
    await page.locator('[data-test="next-step-button"]').click({ force: true });
    await page.locator('[data-test="play-song-button"]').click({ force: true });

    await page.locator('[data-test="highscores-button"]').click({ timeout: 25_000, force: true });
    await page.locator('[data-test="play-next-song-button"]').click({ force: true });
    await expect(page.locator('[data-test="song-preview"]')).toHaveAttribute('data-song', 'e2e-skip-intro-song.json');
    await page.keyboard.press('Enter'); // enter first song
    await expect(page.locator('[data-test="skip-intro"]')).toHaveAttribute('data-test-value', 'true');
});
