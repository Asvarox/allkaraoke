import dotenv from 'dotenv';
import fs from 'fs';
import { Song } from 'interfaces';
import currentSongs from '../public/songs/index.json';
import convertSongToTxt from '../src/Songs/utils/convertSongToTxt';
import convertTxtToSong from '../src/Songs/utils/convertTxtToSong';
import getSongId from '../src/Songs/utils/getSongId';

dotenv.config({ path: '.env.local' });

const API_URL = 'https://eu.posthog.com';
const PROJECT_ID = '281';
const AFTER_DATE = new Date(Date.now() - 1000 * 3600 * 24 * 28).toISOString();

const makeRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${url}`, {
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

const normalizeSong = (song: Song): Song => {
  if (song.title.toLowerCase().trim().endsWith('[duet]')) {
    song.title = song.title.slice(0, -6);
  } else if (song.title.toLowerCase().endsWith('(tv)')) {
    song.title = song.title.slice(0, -4);
  } else if (song.title.toLowerCase().endsWith('(album version)')) {
    song.title = song.title.slice(0, -15);
  }
  song.title = song.title.trim();

  song.language = song.language.map((lang) => {
    if (lang.toLowerCase().startsWith('espa')) {
      return 'Spanish';
    } else if (lang.toLowerCase().endsWith('(romanized)')) {
      return lang.slice(0, -11).trim();
    } else if (lang.toLowerCase().endsWith('(brazil)')) {
      return 'Portuguese';
    }
    return lang;
  });

  song.lastUpdate = new Date().toISOString();

  // @ts-ignore
  song.id = undefined;
  song.id = getSongId(song);

  return song;
};

(async () => {
  const response = await makeRequest(
    `/api/projects/${PROJECT_ID}/events?event=share-song&after=${AFTER_DATE}&limit=200`,
  );

  const fetchedSongIds: string[] = fs.existsSync('./scripts/fetchedSongIds.json')
    ? require('./fetchedSongIds.json')
    : [];

  const newSongIds: string[] = [];

  response.results.forEach((result: any) => {
    try {
      let song = convertTxtToSong(result.properties.song);
      if (!song.id) {
        console.log('Song has no ID', song);
        return;
      }
      normalizeSong(song);

      if (fetchedSongIds.includes(song.id)) {
        console.log(`Song ${song.id} already fetched`);
      } else if (!currentSongs.find((currentSong) => currentSong.id === song.id)) {
        newSongIds.push(song.id);
        song.lastUpdate = new Date().toISOString();
        fs.writeFileSync(`./public/songs/${song.id}.txt`, convertSongToTxt(song));
        console.log(`Added song ${song.id}`);
      } else {
        console.log(`Song ${song.id} already exists`);
      }
    } catch (e) {
      console.warn(`Couldn't convert song ${result.properties.song}`);
    }
  });
  require('./generateIndex');
  /// store fetchedSongIds in a JSON file
  fs.writeFileSync('./scripts/fetchedSongIds.json', JSON.stringify([...fetchedSongIds, ...newSongIds]));
})();
