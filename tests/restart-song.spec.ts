import { expect, test } from '@playwright/test';
import { initTestMode, mockSongs } from './helpers';
import navigateWithKeyboard from './steps/navigateWithKeyboard';

test.beforeEach(async ({ page, context }) => {
    await initTestMode({ page, context });
    await mockSongs({ page, context });
});

test('should restart the song and the scores', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.getByTestId('advanced').click({ force: true });
    await page.getByTestId('save-button').click({ force: true });

    await page.getByTestId('sing-a-song').click({ force: true });
    await page.getByTestId('close-exclude-languages').click({ force: true });

    await expect(page.getByTestId('song-e2e-test.json')).toBeVisible();
    await navigateWithKeyboard(page, 'song-e2e-test-multitrack.json');
    await page.keyboard.press('Enter');

    await page.getByTestId('next-step-button').click({ force: true });
    await page.getByTestId('play-song-button').click({ force: true });

    await expect(async () => {
        const p1score = await page.getByTestId('player-1-score').getAttribute('data-score');

        expect(parseInt(p1score!, 10)).toBeGreaterThan(100);
    }).toPass({ timeout: 15_000 });

    await page.keyboard.press('Backspace');
    await page.getByTestId('button-restart-song').click({ force: true });

    await expect(page.getByTestId('player-1-score')).toHaveAttribute('data-score', '0', { timeout: 15_000 });
});
