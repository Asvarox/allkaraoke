import { Song, SongPreview } from '~/interfaces';
import { removeAccents } from '../../utils/clearString';

export function normalizeSting(str: string) {
  return (
    removeAccents(str)
      .toLowerCase()
      /// remove non-alphanumeric characters and replace spaces with dashes
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      /// remove trailing dashes  &  remove dashes from the start
      .replace(/-+$/, '')
      .replace(/^-+/, '')
      .replace(/-+/g, '-')
  );
}

export default function getSongId(song: Pick<Song | SongPreview, 'artist' | 'title'> & { id?: string }) {
  return song.id ? song.id : normalizeSting(`${song?.artist}-${song?.title}`);
}
