import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';

test.beforeEach(async ({ page }) => {
    await initTestMode(page);
    await mockSongs(page);
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
    await page.keyboard.press('Enter'); // Go to next step

    // Player 1
    // Name
    await page.keyboard.press('ArrowDown'); // player 1 name
    await page.keyboard.press('Enter'); // activate
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

    await page.keyboard.press('ArrowDown');

    await page.keyboard.press('Enter'); // start song
    await expect(page.locator('[data-test="play-next-song-button"]')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('[data-test="player-1-name"]')).toHaveText('E2E Player 1');
    await expect(page.locator('[data-test="player-2-name"]')).toHaveText('E2E Player 2');

    await page.locator('[data-test="play-next-song-button"]').click({ force: true });
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(
        page.locator('[data-test="song-e2e-test-multitrack.json"] >> [data-test="song-stat-indicator"]'),
    ).toContainText('Played today', { ignoreCase: true });
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

    await page.locator('[data-test="play-next-song-button"]').click({ timeout: 25_000, force: true });
    await expect(page.locator('[data-test="song-preview"]')).toHaveAttribute('data-song', 'e2e-skip-intro-song.json');
    await page.keyboard.press('Enter'); // enter first song
    await expect(page.locator('[data-test="skip-intro"]')).toHaveAttribute('data-test-value', 'true');
});

test('Filters', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-test="sing-a-song"]').click({ force: true });

    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await page.keyboard.type('f'); // Show filters
    await expect(page.locator('[data-test="song-list-filters"]')).toBeVisible();

    await page.keyboard.press('Enter'); // focus search song
    await page.keyboard.type('multitrack');
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    for (let i = 0; i < 10; i++) await page.keyboard.press('Backspace');
    await page.keyboard.press('Enter');

    await page.keyboard.press('ArrowRight'); // language filters
    await page.keyboard.press('Enter'); // polish
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    await page.keyboard.press('Enter'); // english
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).not.toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await page.keyboard.press('Enter'); // All

    await page.keyboard.press('ArrowRight'); // duet filters
    await page.keyboard.press('Enter'); // Duet
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    await page.keyboard.press('Enter'); // Solo
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).not.toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    await page.keyboard.press('Enter'); // All
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).toBeVisible();
    // Quick search
    await page.keyboard.type('multitrack');
    await page.keyboard.press('Enter'); // All
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-test="song-e2e-test-multitrack.json"]')).toBeVisible();
    await expect(page.locator('[data-test="song-e2e-test.json"]')).not.toBeVisible();
    await expect(page.locator('[data-test="song-preview"]')).toHaveAttribute('data-song', 'e2e-test-multitrack.json');
});
