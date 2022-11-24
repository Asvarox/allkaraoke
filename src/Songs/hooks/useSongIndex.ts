import { SongPreview } from 'interfaces';
import { useEffect, useState } from 'react';
import SongDao from 'Songs/SongDao';

export default function useSongIndex() {
    const [songIndex, setSongIndex] = useState<SongPreview[] | null>(null);

    const loadSongs = () => SongDao.getIndex().then(setSongIndex);

    useEffect(() => {
        loadSongs();
    }, []);

    return {
        data: songIndex ?? [],
        reload: loadSongs,
    };
}
