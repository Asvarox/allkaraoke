import { Song, SongPreview } from 'interfaces';
import convertTxtToSong from './convertTxtToSong';
import getSongId from './getSongId';

const API_URL = 'https://eu.posthog.com';
const PROJECT_ID = '281';
const AFTER_DATE = new Date(Date.now() - 1000 * 3600 * 24 * 28).toISOString();

const normalizeSong = (song: Song): Song => {
  if (song.title.toLowerCase().trim().endsWith('[duet]')) {
    song.title = song.title.slice(0, -6);
  } else if (song.title.toLowerCase().endsWith('(tv)')) {
    song.title = song.title.slice(0, -4);
  } else if (song.title.toLowerCase().endsWith('(album version)')) {
    song.title = song.title.slice(0, -15);
  } else if (song.title.toLowerCase().endsWith('(movie version)')) {
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

type RequestFunc = (url: string) => Promise<any>;

export const importSongsFromPostHogBase = async (
  mkRequest: RequestFunc,
  currentSongs: SongPreview[],
  fetchedSongIds: string[],
  onSongAdded: (song: Song) => Promise<void>,
) => {
  const response = await mkRequest(
    `${API_URL}/api/projects/${PROJECT_ID}/events?event=share-song&after=${AFTER_DATE}&limit=200`,
  );

  await Promise.all(
    response.results.map(async (result: any) => {
      try {
        let song = convertTxtToSong(result.properties.song);
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
          console.log(`Song ${song.id} already exists`);
        } else {
          song.lastUpdate = new Date().toISOString();
          await onSongAdded(song);
          console.log(`Added song ${song.id}`);
        }
      } catch (e) {
        console.warn(`Couldn't convert song ${result.properties.song}`);
      }
    }),
  );
};
