import { BrowserContext, expect, Page } from '@playwright/test';

export default async function connectRemotePhone(page: Page, context: BrowserContext, name: string) {
    const serverUrl = await page.getByTestId('server-link-input').inputValue();
    const remoteMic = await context.newPage();

    await remoteMic.goto(serverUrl);
    await remoteMic.getByTestId('player-name-input').fill(name);
    await remoteMic.getByTestId('connect-button').click();
    await expect(remoteMic.getByTestId('connect-button')).toContainText('Connected', {
        ignoreCase: true,
    });

    return remoteMic;
}
