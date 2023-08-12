import { Song, SongPreview } from 'interfaces';
import { removeAccents } from '../../utils/clearString';

export default function getSongId(song: Pick<Song | SongPreview, 'artist' | 'title'> & { id?: string }) {
    return song.id
        ? song.id
        : removeAccents(`${song?.artist}-${song?.title}`)
              .toLowerCase()
              /// remove non-alphanumeric characters and replace spaces with dashes
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              /// remove trailing dashes  &  remove dashes from the start
              .replace(/-+$/, '')
              .replace(/^-+/, '')
              .replace(/-+/g, '-');
}
