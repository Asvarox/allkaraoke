import { Song, SongPreview } from '~/interfaces';

import clearString from '../utils/clear-string';
import getSongId from './utils/get-song-id';
import { getFirstNoteStartFromSections } from './utils/notes-selectors';

const generateSearchString = (song: Pick<Song, 'title' | 'artist'>) => clearString(`${song.artist}${song.title}`);

export const getSongPreview = (
  { bar, unsupportedProps, mergedTrack, shortId, ...songData }: Song,
  options: Pick<SongPreview, 'local'> = { local: false },
): SongPreview => ({
  ...songData,
  id: getSongId(songData),
  shortId: shortId ?? 0,
  language: !Array.isArray(songData.language) ? [songData.language as string] : songData.language,
  tracksCount: songData.tracks.length,
  tracks: songData.tracks.map(({ name, sections }) => ({
    name,
    start: getFirstNoteStartFromSections(sections),
  })),
  search: generateSearchString(songData),
  ...options,
});
