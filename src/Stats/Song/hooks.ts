import { SongPreview } from 'interfaces';
import localForage from 'localforage';
import { useEffect, useState } from 'react';
import gameStateEvents from 'Scenes/Game/Singing/GameState/GameStateEvents';
import { useEventEffect } from 'Scenes/Game/Singing/Hooks/useEventListener';
import { getSongKey, SongStats } from 'Stats/Song/common';

export const useSongStats = (song: Pick<SongPreview, 'artist' | 'title'>) => {
    const [stats, setStats] = useState<SongStats | null>(null);

    const storageKey = getSongKey(song);

    const getSongStats = async () => {
        setStats((await localForage.getItem<SongStats>(storageKey)) || { plays: 0, scores: [] });
    };

    useEffect(() => {
        const callback = console.log;
        window.addEventListener('storage', callback);

        getSongStats();

        return () => window.removeEventListener('storage', callback);
    }, [storageKey]);

    useEventEffect(gameStateEvents.songStatStored, getSongStats);

    return stats;
};
