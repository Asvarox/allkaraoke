import { Song, SongPreview } from 'interfaces';
import convertTxtToSong from './convertTxtToSong';
import getSongId from './getSongId';

const API_URL = 'https://eu.posthog.com';
const PROJECT_ID = '281';
const AFTER_DATE = new Date(Date.now() - 1000 * 3600 * 24 * 28).toISOString();

const suffixes = ['(tv)', '(album version)', '(movie version)', '[duet]'];

const normalizeSong = (song: Song): Song => {
  suffixes.forEach((suffix) => {
    if (song.title.toLowerCase().endsWith(suffix)) {
      song.title = song.title.slice(0, -suffix.length);
    }
  });
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

  // @ts-expect-error reset id before generating a new one
  song.id = undefined;
  song.id = getSongId(song);

  return song;
};

type RequestOptions = {
  body?: string;
  method: 'post' | 'get';
  headers?: HeadersInit;
};

type RequestFunc = (url: string, options: RequestOptions) => Promise<any>;

export const importSongsFromPostHogBase = async (
  mkRequest: RequestFunc,
  currentSongs: SongPreview[],
  fetchedSongIds: string[],
  onSongAdded: (song: Song) => Promise<void>,
  onSongRemoved: (songId: string) => Promise<void>,
  from?: string,
) => {
  const sharedSongs = await mkRequest(`${API_URL}/api/projects/${PROJECT_ID}/query`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: `
            select events.properties.song, events.properties.songId, events.created_at
            from events
            where events.created_at > toDateTime('${from ?? AFTER_DATE}')
              and event IN ('share-song', 'unshare-song') and events.properties.$user_id !='3ab0feed-e1d2-4ff0-8780-5db00698eb60'
            ORDER BY events.created_at ASC
            LIMIT 300
        `,
      },
    }),
  });

  const songsAdded: string[] = [];

  for (const [songTxt, songId] of sharedSongs.results as Array<[string, string]>) {
    try {
      if (!songTxt && songId && songsAdded.includes(songId)) {
        await onSongRemoved(songId);
        console.log(`Deleting song ${songId}`);
      }

      const song = convertTxtToSong(songTxt.replaceAll('\\n', '\n').replaceAll('\\"', '"'));
      if (!song.id) {
        console.log('Song has no ID', song);
        return;
      }
      normalizeSong(song);

      if (fetchedSongIds.includes(song.id)) {
        console.log(`Song ${song.id} already fetched`);
      } else if ((song.tracks[0]?.sections.length ?? 0) < 5) {
        console.log(`Song ${song.id} seems to be broken, ${song.tracks[0]?.sections.length} sections found`);
      } else if (currentSongs.find((currentSong) => currentSong.id === song.id)) {
        console.log(`Song ${song.id} already exists (by song id)`);
      } else if (currentSongs.find((currentSong) => currentSong.video === song.video)) {
        console.log(`Song ${song.id} already exists (by video id)`);
      } else {
        song.lastUpdate = new Date().toISOString();
        songsAdded.push(song.id);
        await onSongAdded(song);
        console.log(`Added song ${song.id}`);
      }
    } catch (e) {
      console.warn(`Couldn't convert song ${songTxt}`, e);
    }
  }
};
