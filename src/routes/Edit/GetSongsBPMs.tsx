import { useEffect } from 'react';
import useSongIndex from '~/modules/Songs/hooks/useSongIndex';
import useBackgroundMusic from '~/modules/hooks/useBackgroundMusic';

interface GetSongBpmSearchEntry {
  song_id: string;
  song_title: string;
  song_uri: string;
  tempo: string;
  time_sig: string;
  key_of: string;
  open_key: null;
  artist: {
    id: string;
    name: string;
    uri: string;
    img: string;
    genres: string[];
    from: string;
    mbid: string;
  };
  album: {
    title: string;
    uri: string;
    img: string;
    year: string;
  };
}

export default function GetSongsBPMs() {
  useBackgroundMusic(false);
  const songList = useSongIndex();

  useEffect(() => {
    if (songList.data) {
      const bpms: Record<string, GetSongBpmSearchEntry | null> = {};
      (async () => {
        for (const song of songList.data) {
          if (song.realBpm) continue;
          const params = [
            `lookup=song:${encodeURIComponent(song.title)}+artist:${encodeURIComponent(song.artist)}`,
            'type=both',
            `api_key=${import.meta.env.VITE_APP_GET_SONG_BPM_API_TOKEN!}`,
          ].join('&');

          const response = await fetch(`https://api.getsongbpm.com/search/?${params}`);
          const getSongBPMData: { search: GetSongBpmSearchEntry[] } = await response.json();

          bpms[song.id] = Array.isArray(getSongBPMData.search) ? getSongBPMData.search[0] || null : null;
        }
        console.log(bpms);
      })();
    }
  }, [songList.data]);

  return <>Copy resulting object to `scripts/scraped-bpm-data.json` file and run fillMetadata script</>;
}
