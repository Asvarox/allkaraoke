import { BrowserContext, expect, Page, test } from '@playwright/test';

export async function connectRemoteMic(remoteMicPage: Page) {
    await remoteMicPage.getByTestId('connect-button').click();
    await expect(remoteMicPage.getByTestId('connect-button')).toContainText('Connected', {
        ignoreCase: true,
    });
}

export default async function openAndConnectRemoteMic(page: Page, context: BrowserContext, name: string) {
    return test.step(`Connect remote mic ${name}`, async () => {
        const remoteMic = await context.newPage();
        const serverUrl = await page.getByTestId('server-link-input').inputValue();

        await remoteMic.goto(serverUrl);
        await remoteMic.getByTestId('player-name-input').fill(name);
        await connectRemoteMic(remoteMic);

        return remoteMic;
    });
}
