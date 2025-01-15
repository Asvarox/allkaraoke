import { milliseconds, Song, SongPreview } from 'interfaces';
import memoize from '../../utils/memoize';

export default memoize(function getSongBeatLength(song: Song | SongPreview): milliseconds {
  return (60 / song.bpm / (song.bar ?? 4)) * 1000;
});
