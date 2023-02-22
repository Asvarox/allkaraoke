import { Song, SongPreview } from "../src/interfaces";
import { getFirstNoteStartFromSections } from "../src/Songs/utils/notesSelectors";
import clearString from "../src/utils/clearString";

const generateSearchString = (song: Pick<Song, 'title' | 'artist'>) => clearString(`${song.artist}${song.title}`);

export const getSongPreview = (file: string, songData: Song, local = false): SongPreview => ({
    ...songData,
    file,
    tracksCount: songData.tracks.length,
    tracks: songData.tracks.map(({ name, sections }) => ({
        name,
        start: getFirstNoteStartFromSections(sections),
    })),
    search: generateSearchString(songData),
    local,
});
