import { SongPreview } from 'interfaces';
import localForage from 'localforage';
import { useEffect, useState } from 'react';
import { getSongKey, SongStats } from 'Stats/Song/common';

export const useSongStats = (song: SongPreview) => {
    const [stats, setStats] = useState<SongStats | null>(null);

    const storageKey = getSongKey(song);

    useEffect(() => {
        const callback = console.log;
        window.addEventListener('storage', callback);

        localForage.getItem<SongStats>(storageKey).then((data) => setStats(data || { plays: 0, scores: [] }));

        return () => window.removeEventListener('storage', callback);
    }, [storageKey]);

    return stats;
};
