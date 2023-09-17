import { Song, SongPreview } from 'interfaces';
import getSongBeatLength from 'Songs/utils/getSongBeatLength';

export default function beatToMs(beat: number, song: Song | SongPreview): number {
  return getSongBeatLength(song) * beat;
}
