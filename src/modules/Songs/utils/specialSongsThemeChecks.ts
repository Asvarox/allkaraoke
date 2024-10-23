import { Song, SongPreview } from 'interfaces';
import clearString from 'modules/utils/clearString';

export function isChristmasSong(song: SongPreview | Song) {
  return clearString(song.edition ?? '') === 'christmas';
}

export const getEurovisionYear = (song: SongPreview | Song) => {
  return (
    song.edition
      ?.split(',')
      .find((edition) => edition.toLowerCase().startsWith('esc '))
      ?.replace('Esc ', '')
      ?.trim() ?? undefined
  );
};

export function isEurovisionSong(song: SongPreview | Song) {
  return !!getEurovisionYear(song);
}

export function isHalloweenSong(song: SongPreview | Song) {
  return clearString(song.edition ?? '').includes('halloween');
}
