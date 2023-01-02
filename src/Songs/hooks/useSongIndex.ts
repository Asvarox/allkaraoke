import { SongPreview } from 'interfaces';
import { useEffect, useRef, useState } from 'react';
import SongDao from 'Songs/SongDao';

export default function useSongIndex() {
    const [songIndex, setSongIndex] = useState<SongPreview[] | null>(null);
    // Prevent recreating of the array every render
    const emptyList = useRef<SongPreview[]>([]);

    const loadSongs = () => SongDao.getIndex().then(setSongIndex);

    useEffect(() => {
        loadSongs();
    }, []);

    return {
        data: songIndex ?? emptyList.current,
        reload: loadSongs,
        isLoading: songIndex === null,
    };
}
