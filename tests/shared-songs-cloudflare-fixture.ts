import { Page } from '@playwright/test';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';
import convertTxtToSong from '../src/modules/songs/utils/convert-txt-to-song';

const FIXTURE_PATH = 'tests/fixtures/songs/shared-cloudflare-e2e.txt';

const normalizeSongTxt = (songTxt: string) => songTxt.replaceAll('\r\n', '\n');

export const upsertCloudflareSharedSongFixtureOrMock = async (page: Page, playwrightBaseUrl?: string) => {
  try {
    const baseUrl = playwrightBaseUrl ? new URL(playwrightBaseUrl).origin : 'https://localhost:3000';

    execSync(`pnpm shared-song:upsert-fixture ${baseUrl}`, {
      env: {
        ...process.env,
        SHARED_SONGS_ADMIN_TOKEN: 'local-shared-songs-admin-token',
      },
      stdio: 'inherit',
    });
    return;
  } catch (error) {
    if (process.env.CI) {
      throw error;
    }

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
