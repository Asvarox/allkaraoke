import { Song, SongPreview } from '../interfaces';
import clearString from '../utils/clearString';
import { getFirstNoteStartFromSections } from './utils/notesSelectors';
import getSongId from './utils/getSongId';

const generateSearchString = (song: Pick<Song, 'title' | 'artist'>) => clearString(`${song.artist}${song.title}`);

export const getSongPreview = (file: string, songData: Song, local = false): SongPreview => ({
    ...songData,
    id: getSongId(songData),
    tracksCount: songData.tracks.length,
    tracks: songData.tracks.map(({ name, sections }) => ({
        name,
        start: getFirstNoteStartFromSections(sections),
    })),
    search: generateSearchString(songData),
    local,
});
