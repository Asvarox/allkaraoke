import { useState } from 'react';

import { SongPreview } from '~/interfaces';
import { trackOnlineSongSelected } from '~/modules/online/client/online-analytics';
import { loadSongForUpload, uploadSongToRoom } from '~/modules/online/client/song-transfer';

/** Transfers the host's pick to the room. Owned above the lobby ↔ song-browser switch: the browser
 * unmounts the moment a song is picked, and it's the lobby that has to show the transfer through. */
export default function useSongUpload() {
  const [state, setState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const upload = async (song: SongPreview, tolerance: number, difficulty?: string) => {
    setState('uploading');
    setError(null);
    try {
      const fullSong = await loadSongForUpload(song);
      await uploadSongToRoom(fullSong, tolerance, difficulty);
      trackOnlineSongSelected(song.id, song.artist, song.title);
      setState('idle');
    } catch (uploadError) {
      setState('error');
      setError(uploadError instanceof Error ? uploadError.message : String(uploadError));
    }
  };

  return { state, error, upload };
}

export type SongUpload = ReturnType<typeof useSongUpload>;
