import { Song, SongPreview } from 'interfaces';
import getSongBeatLength from 'Scenes/Game/Singing/GameState/Helpers/getSongBeatLength';

export default function beatToMs(beat: number, song: Song | SongPreview): number {
    return getSongBeatLength(song) * beat;
}
