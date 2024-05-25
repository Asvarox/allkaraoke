import { Song, SongPreview } from 'interfaces';
import clearString from '../utils/clearString';
import getSongId from './utils/getSongId';
import { getFirstNoteStartFromSections } from './utils/notesSelectors';

const generateSearchString = (song: Pick<Song, 'title' | 'artist'>) => clearString(`${song.artist}${song.title}`);

export const getSongPreview = (
  { bar, unsupportedProps, mergedTrack, ...songData }: Song,
  local = false,
): SongPreview => ({
  ...songData,
  id: getSongId(songData),
  language: !Array.isArray(songData.language) ? [songData.language as string] : songData.language,
  tracksCount: songData.tracks.length,
  tracks: songData.tracks.map(({ name, sections }) => ({
    name,
    start: getFirstNoteStartFromSections(sections),
  })),
  search: generateSearchString(songData),
  local,
});
