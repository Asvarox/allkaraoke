import { Page } from '@playwright/test';
import e2eDuetSong from './fixtures/songs/e2e-test-multitrack.json';
import e2eSong from './fixtures/songs/e2e-test.json';
import index from './fixtures/songs/index.json';

export const mockSongs = async (page: Page) => {
    await page.route('/songs/index.json', (route) => route.fulfill({ status: 200, body: JSON.stringify(index) }));
    await page.route('/songs/e2e-test.json', (route) => route.fulfill({ status: 200, body: JSON.stringify(e2eSong) }));
    await page.route('/songs/e2e-test-multitrack.json', (route) =>
        route.fulfill({ status: 200, body: JSON.stringify(e2eDuetSong) }),
    );
};

export const initTestMode = async (page: Page) => {
    await page.addInitScript(() => {
        window.Math.random = () => 0.5;

        // @ts-expect-error
        window.isE2ETests = true;
    });
};
