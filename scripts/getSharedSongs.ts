import dotenv from 'dotenv';
import fs from 'fs';
import { SongPreview } from '~/interfaces';
import currentSongs from '../public/songs/index.json';
import convertSongToTxt from '../src/modules/Songs/utils/convertSongToTxt';
import { importSongsFromPostHogBase } from '../src/modules/Songs/utils/importSongsFromPostHogBase';

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
    (url, options) => makeRequest(url, options),
    currentSongs as SongPreview[],
    fetchedSongIds,
    async (song) => {
      newSongIds.push(song.id);
      fs.writeFileSync(`./public/songs/${song.id}.txt`, convertSongToTxt(song));
    },
    async (songId) => {
      fs.rmSync(`./public/songs/${songId}.txt`);
    },
  );

  require('./generateIndex');
  /// store fetchedSongIds in a JSON file
  fs.writeFileSync('./scripts/fetchedSongIds.json', JSON.stringify([...fetchedSongIds, ...newSongIds]));
})();
