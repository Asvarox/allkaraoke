import SongsService from 'Songs/SongsService';
import { Song } from 'interfaces';
import { importSongsFromPostHogBase } from './importSongsFromPostHogBase';

const importSongsFromPostHog = async () => {
  const posthogKey = sessionStorage.getItem('posthog_key') || prompt('Enter PostHog PAT');

  if (!posthogKey) {
    return;
  }
  sessionStorage.setItem('posthog_key', posthogKey);

  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 10);

  let from = prompt('Enter from', localStorage.getItem('posthog_from') || defaultFrom.toISOString());
  if (from === null) {
    return;
  }
  from = new Date(from).toISOString();

  localStorage.setItem('posthog_from', new Date().toISOString());
  const makeRequest = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${posthogKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  };

  await importSongsFromPostHogBase(
    makeRequest,
    await SongsService.getIndex(true),
    [],
    async (song: Song) => {
      return SongsService.store(song);
    },
    from,
  );
};

export default importSongsFromPostHog;
