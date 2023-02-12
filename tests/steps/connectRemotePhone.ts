import { BrowserContext, expect, Page, test } from '@playwright/test';

export default async function connectRemotePhone(page: Page, context: BrowserContext, name: string) {
    return test.step(`Connect remote mic ${name}`, async () => {
        const remoteMic = await context.newPage();
        const serverUrl = await page.getByTestId('server-link-input').inputValue();

        await remoteMic.goto(serverUrl);
        await remoteMic.getByTestId('player-name-input').fill(name);
        await remoteMic.getByTestId('connect-button').click();
        await expect(remoteMic.getByTestId('connect-button')).toContainText('Connected', {
            ignoreCase: true,
        });
        return remoteMic;
    });
}
