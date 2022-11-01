import { expect, test } from '@playwright/test';

test('Help', async ({ page }) => {
    await page.goto('/?e2e-test');
    await expect(page.locator('[data-test="help-container"]')).toBeVisible();
    await page.keyboard.press('h'); // toggle help
    await expect(page.locator('[data-test="help-container"]')).not.toBeVisible();
    await page.reload();
    await expect(page.locator('[data-test="sing-a-song"]')).toBeVisible();
    await expect(page.locator('[data-test="help-container"]')).not.toBeVisible();
});
