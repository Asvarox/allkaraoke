import { Song } from 'interfaces';
import SongsService from 'modules/Songs/SongsService';
import storage from 'modules/utils/storage';
import { importSongsFromPostHogBase } from './importSongsFromPostHogBase';

const importSongsFromPostHog = async () => {
  const posthogKey = storage.session.getItem('posthog_key') || prompt('Enter PostHog PAT');

  if (!posthogKey) {
    return;
  }
  storage.session.setItem('posthog_key', posthogKey);

  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 10);

  let from = prompt('Enter from', storage.local.getItem('posthog_from') || defaultFrom.toISOString());
  if (from === null) {
    return;
  }
  from = new Date(from).toISOString();

  const makeRequest = async (url: string, options: RequestInit) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${posthogKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  };

  let lastSongAdd: number = storage.local.getItem('posthog_from')
    ? new Date(storage.local.getItem('posthog_from')!).getTime()
    : 0;

  await importSongsFromPostHogBase(
    makeRequest,
    (await SongsService.getIndex(true)).filter((song) => !song.local),
    [],
    async (song: Song, createdAt) => {
      await SongsService.store(song, false);
      const createdAtTime = new Date(createdAt).getTime();
      if (createdAtTime > lastSongAdd) {
        lastSongAdd = createdAtTime;
      }
    },
    async (songId: string) => {
      return SongsService.deleteSong(songId);
    },
    from,
  );
  storage.local.setItem('posthog_from', new Date(lastSongAdd).toISOString());
};

export default importSongsFromPostHog;
