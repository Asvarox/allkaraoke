import { memoize } from 'lodash';
import { Song } from '../../../../../interfaces';

export default memoize(function getSongBeatLength(song: Song): number {
    return (60 / song.bpm / song.bar) * 1000;
});
