import dotenv from 'dotenv';
import fs from 'fs';
import currentSongs from '../public/songs/index.json';
import convertTxtToSong from '../src/Songs/utils/convertTxtToSong';

dotenv.config({ path: '.env.local' });

const API_URL = 'https://eu.posthog.com';
const PROJECT_ID = '281';
const AFTER_DATE = new Date(Date.now() - 1000 * 3600 * 24 * 28).toISOString();

const makeRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${process.env.POSTHOG_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

(async () => {
  const response = await makeRequest(`/api/projects/${PROJECT_ID}/events?event=share-song&after=${AFTER_DATE}`);

  response.results.map((result: any) => {
    try {
      const song = convertTxtToSong(result.properties.song);
      if (!song.id) {
        console.log('Song has no ID', song);
      } else if (!currentSongs.find((currentSong) => currentSong.id === song.id)) {
        fs.writeFileSync(`./public/songs/${song.id}.txt`, result.properties.song);
        console.log(`Added song ${song.id}`);
      } else {
        console.log(`Song ${song.id} already exists`);
      }
    } catch (e) {
      console.warn(`Couldn't convert song ${result.properties.song}`);
    }
  });
  require('./generateIndex');
})();
