import { SongPreview } from 'interfaces';
import { useQuery } from 'react-query';

export default function useSongIndex() {
    const query = useQuery<SongPreview[]>('songList', () =>
        fetch('./songs/index.json').then((response) => response.json()),
    );

    return {
        data: query.data ?? [],
    };
}
