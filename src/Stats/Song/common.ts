import { SingSetup, SongPreview } from 'interfaces';

export interface SongStats {
    plays: number;
    scores: Array<{
        setup: SingSetup;
        scores: Array<{ name: string; score: number }>;
        date: string;
    }>;
}

export const getSongKey = (song: Pick<SongPreview, 'artist' | 'title'>) => `${song.artist}-${song.title}`.toLowerCase();
