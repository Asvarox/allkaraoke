import { useEffect, useRef, useState } from 'react';
import { Song } from '~/interfaces';
import { downloadSongFromRoom } from '~/modules/online/client/song-transfer';
import { ChartManifest } from '~/modules/online/protocol/types';

/** Downloads and reconstructs the room's song whenever the selected chart changes.
 * Works for late joiners too — the chart is kept in room storage. */
export default function useOnlineSong(manifest: ChartManifest | null | undefined) {
  const [song, setSong] = useState<Song | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The manifest object identity changes on every room-state push; the hash identifies the chart
  const loadedHash = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!manifest) {
      loadedHash.current = undefined;
      setSong(null);
      setError(null);
      return;
    }
    if (loadedHash.current === manifest.hash) return;

    const hash = manifest.hash;
    loadedHash.current = hash;
    setSong(null);
    setError(null);
    downloadSongFromRoom(manifest)
      .then((downloaded) => {
        if (loadedHash.current === hash) setSong(downloaded);
      })
      .catch((downloadError) => {
        if (loadedHash.current === hash) {
          setError(downloadError instanceof Error ? downloadError.message : String(downloadError));
        }
      });
  }, [manifest]);

  return { song, error };
}
