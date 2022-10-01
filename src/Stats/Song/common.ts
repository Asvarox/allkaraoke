import { SongPreview } from 'interfaces';

export interface SongStats {
    plays: number;
}

export const getSongKey = (song: SongPreview) => `${song.artist}-${song.title}`.toLowerCase();
