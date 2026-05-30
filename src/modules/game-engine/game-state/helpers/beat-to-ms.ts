import { milliseconds, Song, SongPreview } from '~/interfaces';
import getSongBeatLength from '~/modules/songs/utils/get-song-beat-length';

export default function beatToMs(beat: number, song: Song | SongPreview): milliseconds {
  return getSongBeatLength(song) * beat;
}
