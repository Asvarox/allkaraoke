import { Song, SongPreview } from 'interfaces';
import clearString from 'utils/clearString';

export default function isChristmasSong(song: SongPreview | Song) {
  return clearString(song.edition ?? '') === 'christmas';
}
