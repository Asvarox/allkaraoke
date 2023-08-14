import { BrowserContext, expect, Page, test } from '@playwright/test';
import { mockSongs } from '../helpers';

export async function connectRemoteMic(remoteMicPage: Page) {
    await remoteMicPage.getByTestId('connect-button').click();
    await expect(remoteMicPage.getByTestId('connect-button')).toContainText('Connected', {
        ignoreCase: true,
    });
}
export async function openRemoteMic(page: Page, context: BrowserContext) {
    const remoteMic = await context.newPage();
    await mockSongs({ page: remoteMic, context });

    const serverUrl = await page.getByTestId('server-link-input').inputValue();
    await remoteMic.goto(serverUrl);
    await remoteMic.getByTestId('confirm-wifi-connection').click();

    return remoteMic;
}

export default async function openAndConnectRemoteMic(page: Page, context: BrowserContext, name: string) {
    return test.step(`Connect remote mic ${name}`, async () => {
        const remoteMic = await openRemoteMic(page, context);

        await remoteMic.getByTestId('player-name-input').fill(name);
        await connectRemoteMic(remoteMic);

        return remoteMic;
    });
}
