import { milliseconds, Song, SongPreview } from '~/interfaces';
import getSongBeatLength from '~/modules/Songs/utils/getSongBeatLength';

export default function beatToMs(beat: number, song: Song | SongPreview): milliseconds {
  return getSongBeatLength(song) * beat;
}
