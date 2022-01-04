import { Song } from "../../../interfaces";

export default function getSongBeatLength(song: Song): number {
    return (60 / song.bpm / song.bar) * 1000;
}