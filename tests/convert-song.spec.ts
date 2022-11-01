import { expect, test } from '@playwright/test';

const txtfile = `
#TITLE:Friday I'm in Love
#ARTIST:The Cure
#LANGUAGE:English
#YEAR:1992
#VIDEOGAP:0,3
#BPM:272
#GAP:33088,24
: 0 3 58 I
`;

test('Convert song', async ({ page }) => {
    await page.goto('/?e2e-test');
    await page.locator('[data-test="convert-song"]').click();
    await expect(page.locator('[data-test="output"]')).toBeVisible();
    await page.locator('[data-test="input-txt"]').fill('');
    await page.locator('[data-test="input-txt"]').type(txtfile);
    await page.locator('[data-test="input-video-url"]').fill('');
    await page.locator('[data-test="input-video-url"]').type('https://www.youtube.com/watch?v=8YKAHgwLEMg');
    await expect(page.locator('[data-test="player-container"]')).toBeVisible();
});
