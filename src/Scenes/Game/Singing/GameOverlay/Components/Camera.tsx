import { useEffect, useMemo, useRef } from 'react';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import isNotesSection from 'Songs/utils/isNotesSection';
import CameraManager from 'Camera/CameraManager';
import { cameraShot } from 'SoundManager';
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
            .reduce((accumulator, currentObject) => {
                if (!accumulator.some((obj) => obj.start === currentObject.start)) {
                    accumulator.push(currentObject);
                }
                return accumulator;
            }, [] as Note[]);

        console.log(notes.map((note) => note.start));
        const chunkSize = Math.ceil(notes.length / 10); // get chunk size to split the array into 10 chunks
        const chunks = Array.from({ length: 10 }, (_, i) => notes.slice(i * chunkSize, (i + 1) * chunkSize)); // split the array into 10 chunks

        const beatsToPhoto = chunks
            .map((chunk) => {
                const longest = Math.max(...chunk.map((note) => note.length));
                return chunk.find((obj) => obj.length === longest)!;
            })
            .map((note) => Math.round(note.start + note.length / 2));

        console.log([...new Set(beatsToPhoto)].sort((a, b) => a - b));

        return [...new Set(beatsToPhoto)].sort((a, b) => a - b);
    }, [song, singSetup]);

    const taken = useRef<number[]>([]);

    useEffect(() => {
        const beat = GameState.getCurrentBeat();
        console.log(beat);
        const nextPhotoToTake = photoTimestamps[taken.current.length];
        if (beat > nextPhotoToTake) {
            CameraManager.takePhoto();
            cameraShot.play();
            taken.current.push(nextPhotoToTake);
        }
    });

    return <></>;
}
