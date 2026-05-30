# Song Mocking

## Overview

E2E tests never hit the real song API. Instead, `mockSongs()` from `tests/helpers.ts` intercepts Playwright network routes and returns fixture data loaded from `tests/fixtures/songs/*.txt`.

## How It Works

```ts
// tests/helpers.ts
import { readFileSync, readdirSync } from 'fs';
import { getSongPreview } from '../src/modules/Songs/utils';
import convertSongToTxt from '../src/modules/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../src/modules/Songs/utils/convertTxtToSong';

// At module load: read all .txt fixture files and parse them into Song objects
const songs = readdirSync('./tests/fixtures/songs/')
  .filter((file) => file.endsWith('.txt'))
  .map((file) => ({
    song: convertTxtToSong(readFileSync(`./tests/fixtures/songs/${file}`, { encoding: 'utf-8' })),
  }));

export const mockSongs = async ({ page }: { page: Page; context: BrowserContext }) => {
  // Build lightweight preview index and intercept the song list route
  const index = songs.map(({ song }) => getSongPreview(song));
  await page.route('/songs/index.json', (route) => route.fulfill({ status: 200, body: JSON.stringify(index) }));

  // Return empty popularity data
  await page.route('/most-popular-songs.json', (route) => route.fulfill({ status: 200, body: JSON.stringify({}) }));

  // Intercept each individual song route: /songs/<id>.txt
  for (const song of songs) {
    await page.route(`/songs/${song.song.id}.txt`, (route) =>
      route.fulfill({ status: 200, body: convertSongToTxt(song.song) }),
    );
  }
};
```

## Fixture Song Format

Song fixtures are UltraStar `.txt` files in `tests/fixtures/songs/`. The filename does **not** matter — the song's ID comes from the `#ALLKARAOKE_ID` header inside the file.

Example (`e2e-single-english-1995.txt`):

```txt
#ARTIST:Test
#TITLE:E2E
#CREATOR:author
#BPM:200
#YEAR:1995
#VIDEO:v=koBUXESJZ8g
#LANGUAGE:English
#GAP:1000
#ALLKARAOKE_SID:8
#ALLKARAOKE_ID:e2e-single-english-1995
#ALLKARAOKE_LASTUPDATE:2022-08-18T17:12:59.918Z
#ALLKARAOKE_CREATORURL:authorUrl
#ALLKARAOKE_REALBPM:200
#ALLKARAOKE_SOURCEURL:sourceUrl
: 0 10 0 First
: 15 10 0 Second
- 50
: 60 10 0 Fourth
E
```

Key headers:

- `#ALLKARAOKE_ID` — used as the song's unique ID in routes and test selectors (e.g. `song-${ID}`)
- `#LANGUAGE` — determines which language filter shows/hides the song
- `#VIDEO` — YouTube video ID; in E2E tests the video is mocked/skipped anyway

## Available Fixture Songs

| File                             | ID                           | Language       | Notes                     |
| -------------------------------- | ---------------------------- | -------------- | ------------------------- |
| `e2e-single-english-1995.txt`    | `e2e-single-english-1995`    | English        | Basic single-track song   |
| `e2e-multitrack-polish-1994.txt` | `e2e-multitrack-polish-1994` | Polish         | Duet/multitrack song      |
| `e2e-christmas-english-1995.txt` | `e2e-christmas-english-1995` | English        | Christmas playlist item   |
| `e2e-cote-dazur-french-1994.txt` | `e2e-cote-dazur-french-1994` | French         | —                         |
| `e2e-croissant-french-1994.txt`  | `e2e-croissant-french-1994`  | French         | —                         |
| `e2e-english-polish-1994.txt`    | `e2e-english-polish-1994`    | English+Polish | Bilingual                 |
| `e2e-new-english-1995.txt`       | `e2e-new-english-1995`       | English        | —                         |
| `e2e-pass-test-spanish-1994.txt` | `e2e-pass-test-spanish-1994` | Spanish        | For Pass The Mic tests    |
| `e2e-skip-intro-polish.txt`      | `e2e-skip-intro-polish`      | Polish         | Has skip-intro section    |
| `zzz-last-polish-1994.txt`       | `zzz-last-polish-1994`       | Polish         | Sorts last alphabetically |

## Adding a New Fixture Song

1. Create a new `.txt` file in `tests/fixtures/songs/` using the UltraStar format.
2. Set a unique `#ALLKARAOKE_ID` (used as the song ID in tests and routes).
3. The song is automatically picked up by `mockSongs()` — no registration needed.
4. Reference the song in tests by its ID:
   ```ts
   const song = { ID: 'my-new-test-song', language: 'English' };
   await pages.songListPage.focusSong(song.ID);
   ```

## Additional Helpers in helpers.ts

| Helper                             | Purpose                                                                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `initTestMode({ page, context })`  | Sets `window.isE2ETests = true` before page load so the app can skip certain UI (e.g. service worker)                                    |
| `mockRandom({ context }, value?)`  | Overrides `Math.random` with a fixed value (default `0.5`) for deterministic results                                                     |
| `stubUserMedia({ page, context })` | Replaces `navigator.mediaDevices` with a simulator; call `window.mediaSimulator.connectMediaDevices(...)` in tests to add/remove devices |
