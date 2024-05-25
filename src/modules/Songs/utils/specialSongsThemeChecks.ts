import { Song, SongPreview } from 'interfaces';
import clearString from 'modules/utils/clearString';

export function isChristmasSong(song: SongPreview | Song) {
  return clearString(song.edition ?? '') === 'christmas';
}

export function isEurovisionSong(song: SongPreview | Song) {
  return clearString(song.edition ?? '').startsWith('esc');
}
