import dayjs from 'dayjs';
import { SongPreview } from '~/interfaces';

const after = dayjs().subtract(31, 'days');
export default function isSongRecentlyUpdated(song: SongPreview): boolean {
  return !!song.lastUpdate && dayjs(song.lastUpdate).isAfter(after);
}
