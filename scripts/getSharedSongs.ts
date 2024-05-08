import dotenv from 'dotenv';
import fs from 'fs';
import currentSongs from '../public/songs/index.json';
import convertSongToTxt from '../src/Songs/utils/convertSongToTxt';
import { importSongsFromPostHogBase } from '../src/Songs/utils/importSongsFromPostHogBase';
import { SongPreview } from '../src/interfaces';

dotenv.config({ path: '.env.local' });

const makeRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${process.env.VITE_APP_POSTHOG_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

(async () => {
  const fetchedSongIds: string[] = fs.existsSync('./scripts/fetchedSongIds.json')
    ? require('./fetchedSongIds.json')
    : [];
  const newSongIds: string[] = [];

  await importSongsFromPostHogBase(
    (url: string) => makeRequest(url),
    currentSongs as SongPreview[],
    fetchedSongIds,
    async (song) => {
      newSongIds.push(song.id);
      fs.writeFileSync(`./public/songs/${song.id}.txt`, convertSongToTxt(song));
    },
  );

  require('./generateIndex');
  /// store fetchedSongIds in a JSON file
  fs.writeFileSync('./scripts/fetchedSongIds.json', JSON.stringify([...fetchedSongIds, ...newSongIds]));
})();
