import { memoize } from 'es-toolkit';
import { milliseconds, Song, SongPreview } from 'interfaces';

export default memoize(function getSongBeatLength(song: Song | SongPreview): milliseconds {
  return (60 / song.bpm / (song.bar ?? 4)) * 1000;
});
