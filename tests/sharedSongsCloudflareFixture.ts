import { Page } from '@playwright/test';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';
import convertTxtToSong from '../src/modules/Songs/utils/convertTxtToSong';

const FIXTURE_PATH = 'tests/fixtures/songs/shared-cloudflare-e2e.txt';

const normalizeSongTxt = (songTxt: string) => songTxt.replaceAll('\r\n', '\n');

export const upsertCloudflareSharedSongFixtureOrMock = async (page: Page) => {
  try {
    execSync('pnpm shared-song:upsert-fixture', {
      env: {
        ...process.env,
        SHARED_SONGS_ADMIN_URL: process.env.PROD_RUN ? 'https://localhost:3010' : 'http://127.0.0.1:8788',
        SHARED_SONGS_ADMIN_TOKEN: 'local-shared-songs-admin-token',
      },
      stdio: 'inherit',
    });
    return;
  } catch {
    const fixtureAbsolutePath = path.resolve(process.cwd(), FIXTURE_PATH);
    const songTxt = normalizeSongTxt(readFileSync(fixtureAbsolutePath, 'utf-8'));
    const song = convertTxtToSong(songTxt);

    const sharedSongPayload = {
      externalSongId: song.id,
      songId: song.id,
      songTxt,
      artist: song.artist,
      title: song.title,
      language: song.language,
      videoId: song.video,
    };

    await page.route('**/shared-songs?**', async (route) => {
      const requestUrl = new URL(route.request().url());
      const query = requestUrl.searchParams.get('query')?.trim().toLowerCase() ?? '';
      const title = sharedSongPayload.title.toLowerCase();
      const artist = sharedSongPayload.artist.toLowerCase();
      const shouldInclude = !!query && (title.includes(query) || artist.includes(query));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          shouldInclude
            ? [
                {
                  externalSongId: sharedSongPayload.externalSongId,
                  songId: sharedSongPayload.songId,
                  title: sharedSongPayload.title,
                  artist: sharedSongPayload.artist,
                  language: sharedSongPayload.language,
                  videoId: sharedSongPayload.videoId,
                },
              ]
            : [],
        ),
      });
    });

    await page.route('**/shared-song?**', async (route) => {
      const requestUrl = new URL(route.request().url());
      const songId = requestUrl.searchParams.get('id');

      if (songId !== sharedSongPayload.externalSongId) {
        await route.fulfill({ status: 404, body: 'Song not found' });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sharedSongPayload),
      });
    });
  }
};
