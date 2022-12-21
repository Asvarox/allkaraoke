import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import navigateWithKeyboard from './steps/navigateWithKeyboard';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('skip the intro from menu', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('advanced').click({ force: true });
    await page.getByTestId('save-button').click({ force: true });

    await page.getByTestId('sing-a-song').click({ force: true });
    await expect(page.getByTestId('song-e2e-skip-intro-song.json')).toBeVisible();

    await navigateWithKeyboard(page, 'song-e2e-skip-intro-song.json');
    await page.keyboard.press('Enter'); // enter first song

    await page.getByTestId('skip-intro').click({ force: true });
    await expect(page.getByTestId('skip-intro')).toHaveAttribute('data-test-value', 'true');
    await page.getByTestId('next-step-button').click({ force: true });
    await page.getByTestId('play-song-button').click({ force: true });

    await page.getByTestId('highscores-button').click({ timeout: 15_000, force: true });
    await page.getByTestId('play-next-song-button').click({ force: true });
    await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', 'e2e-skip-intro-song.json');
    await page.keyboard.press('Enter'); // enter first song
    await expect(page.getByTestId('skip-intro')).toHaveAttribute('data-test-value', 'true');
});

test('skip the intro from the song', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('advanced').click({ force: true });
    await page.getByTestId('save-button').click({ force: true });

    await page.getByTestId('sing-a-song').click({ force: true });
    await expect(page.getByTestId('song-preview')).toHaveAttribute('data-song', 'e2e-skip-intro-song.json');
    await page.keyboard.press('Enter'); // enter first song

    await expect(page.getByTestId('skip-intro')).toHaveAttribute('data-test-value', 'false');
    await page.getByTestId('next-step-button').click({ force: true });
    await page.getByTestId('play-song-button').click({ force: true });

    await expect(page.getByTestId('skip-intro-info')).toBeVisible();
    await page.keyboard.press('Enter');

    await page.getByTestId('highscores-button').click({ timeout: 15_000, force: true });
});
