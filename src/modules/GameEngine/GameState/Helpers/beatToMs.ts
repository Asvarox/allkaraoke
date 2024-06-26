import { Song, SongPreview } from 'interfaces';
import getSongBeatLength from 'modules/Songs/utils/getSongBeatLength';

export default function beatToMs(beat: number, song: Song | SongPreview): number {
  return getSongBeatLength(song) * beat;
}
