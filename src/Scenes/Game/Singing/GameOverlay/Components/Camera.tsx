import { useEffect, useMemo, useRef } from 'react';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import isNotesSection from 'Songs/utils/isNotesSection';
import CameraManager from 'Camera/CameraManager';
import { Note } from 'interfaces';

export default function Camera() {
    const song = GameState.getSong();
    const singSetup = GameState.getSingSetup();
    const photoTimestamps = useMemo(() => {
        if (!song || !singSetup) return [];

        const notes = singSetup.players
            .map((player) => song.tracks[player.track])
            .map((track) =>
                track.sections
                    .filter(isNotesSection)
                    .map((notes) => notes.notes)
                    .flat(),
            )
            .flat()
            // Remove duplicate notes
            .reduce((accumulator, note) => {
                if (!accumulator.some((obj) => obj.start === note.start)) {
                    accumulator.push(note);
                }
                return accumulator;
            }, [] as Note[]);

        const chunkSize = Math.ceil(notes.length / 8); // get chunk size to split the array into 10 chunks
        // split the array into 10 chunks
        const beatsToPhoto = Array.from({ length: 8 }, (_, i) => notes.slice(i * chunkSize, (i + 1) * chunkSize))
            .map((chunk) => {
                const longest = Math.max(...chunk.map((note) => note.length));
                return chunk.find((obj) => obj.length === longest);
            })
            .filter((note): note is Note => note !== undefined)
            .map((note) => Math.round(note.start + note.length / 2));

        return [...new Set(beatsToPhoto)].sort((a, b) => a - b);
    }, [song, singSetup]);

    const taken = useRef<number[]>([]);

    useEffect(() => {
        const beat = GameState.getCurrentBeat();

        const nextPhotoToTake = photoTimestamps[taken.current.length];
        if (beat > nextPhotoToTake) {
            CameraManager.takePhoto();
            taken.current.push(nextPhotoToTake);
        }
    });

    return <></>;
}
