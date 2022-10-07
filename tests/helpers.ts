import { Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'fs';
import { getSongPreview } from '../scripts/utils';

const songs = readdirSync('./tests/fixtures/songs/')
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
        file,
        song: JSON.parse(readFileSync(`./tests/fixtures/songs/${file}`, { encoding: 'utf-8' })),
    }));

export const mockSongs = async (page: Page) => {
    const index = songs.map(({ file, song }) => getSongPreview(file, song));
    await page.route('/songs/index.json', (route) => route.fulfill({ status: 200, body: JSON.stringify(index) }));

    for (const song of songs) {
        await page.route(`/songs/${song.file}`, (route) =>
            route.fulfill({ status: 200, body: JSON.stringify(song.song) }),
        );
    }
};

export const initTestMode = async (page: Page) => {
    await page.addInitScript(() => {
        window.Math.random = () => 0.5;

        // @ts-expect-error
        window.isE2ETests = true;
    });
};
