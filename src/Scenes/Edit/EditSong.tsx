import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Note, Song } from '../../interfaces';
import getSongBeatLength from '../Game/Singing/Helpers/getSongBeatLength';
import isNotesSection from '../Game/Singing/Helpers/isNotesSection';
import Player, { PlayerRef } from '../Game/Singing/Player';

import { cloneDeep } from 'lodash'
import calculateProperBPM from '../Convert/calculateProperBpm';
import normaliseGap from './Helpers/normaliseGap';
import normaliseSectionPaddings from './Helpers/normaliseSectionPaddings';

interface Props {
    song: Song,
    onUpdate?: (song: Song) => void;
}

const shiftGap = (song: Song, gapShift: number): Song => ({ ...song, gap: song.gap + gapShift });
const shiftVideoGap = (song: Song, gapShift: number): Song => ({ ...song, videoGap: (song.videoGap ?? 0) + gapShift });

const formatMsec = (msec: number) => {
    const minutes = Math.floor(msec / 1000 / 60);
    const seconds = Math.floor(msec / 1000) - minutes * 60;
    const miliseconds = Math.floor(msec % 1000);

    return (
        <Pre>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}.{String(miliseconds).padStart(3, '0')}
        </Pre>
    );
};

const playerWidth = 850;
const playerHeight = (700 / 16) * 9;

export default function EditSong({ song, onUpdate }: Props) {
    const player = useRef<PlayerRef | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);

    const [gapShift, setGapShift] = useState<number>(0);
    const [videoGapShift, setVideoGapShift] = useState<number>(0);

    const [desiredLastNoteEnd, setDesiredLastNoteEnd] = useState<number>(0);

    const newSong = useMemo(() => {
        let processed = cloneDeep(song);

        processed = normaliseGap(processed);
        processed = normaliseSectionPaddings(processed);
        processed = shiftGap(processed, gapShift);
        processed = shiftVideoGap(processed, videoGapShift);

        return processed;
    }, [gapShift, videoGapShift, song]);

    useEffect(() => {
        onUpdate?.(newSong);
    }, [gapShift, videoGapShift]);

    let beatLength: number | undefined;

    beatLength = getSongBeatLength(newSong);

    const seekBy = (bySec: number) => player.current?.seekTo((currentTime + bySec) / 1000);
    const seekTo = (toSec: number, offset: number = -2) => player.current?.seekTo(toSec / 1000 + offset)
    const msec = (ms: number | undefined) => <button onClick={() => seekTo(ms ?? 0)}>{formatMsec((ms ?? 0))}</button>;

    return (
                    <Preview>
                        <PlayerContainer>
                        <Player
                            song={newSong}
                            showControls
                            autoplay={false}
                            width={playerWidth}
                            height={playerHeight}
                            ref={player}
                            onTimeUpdate={setCurrentTime}
                            tracksForPlayers={[0, song.tracks.length - 1]} // todo: make selectable in UI
                        />
                        </PlayerContainer>
                        <Editor>
                            <EditorRow>
                                Playback speed:
                                <InputGroup>
                                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                        <InputGroupButton
                                            key={speed}
                                            onClick={() => player.current?.setPlaybackSpeed(speed)}>
                                            {speed}
                                        </InputGroupButton>
                                    ))}
                                </InputGroup>
                            </EditorRow>
                            <EditorRow>
                                Current time: {formatMsec(currentTime)}
                                <InputGroup>
                                    <InputGroupButton onClick={() => seekBy(-10000)}>-10s</InputGroupButton>
                                    <InputGroupButton onClick={() => seekBy(-5000)}>-5s</InputGroupButton>
                                    <InputGroupButton onClick={() => seekBy(-1000)}>-1s</InputGroupButton>
                                    <InputGroupButton onClick={() => seekBy(-500)}>-0.5s</InputGroupButton>
                                    <div style={{ flex: 1 }}>
                                        <Pre>{currentTime.toFixed(0)}</Pre>
                                    </div>
                                    <InputGroupButton onClick={() => seekBy(+500)}>+0.5s</InputGroupButton>
                                    <InputGroupButton onClick={() => seekBy(+1000)}>+1s</InputGroupButton>
                                    <InputGroupButton onClick={() => seekBy(+5000)}>+5s</InputGroupButton>
                                    <InputGroupButton onClick={() => seekBy(+10000)}>+10s</InputGroupButton>
                                </InputGroup>
                            </EditorRow>
                            <EditorRow>
                                Gap shift (final gap: {msec(newSong.gap)})
                                <InputGroup>
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift - 1000)}>
                                        -1000
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift - 500)}>
                                        -500
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift - 50)}>
                                        -50
                                    </InputGroupButton>
                                    <InputGroupInput
                                        type="text"
                                        value={gapShift}
                                        onChange={(e) => setGapShift(+e.target.value)}
                                        placeholder="Gap shift"
                                    />
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift + 50)}>
                                        +50
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift + 500)}>
                                        +500
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setGapShift((shift) => shift + 1000)}>
                                        +1000
                                    </InputGroupButton>
                                </InputGroup>
                            </EditorRow>
                            <EditorRow>
                                Video Gap shift (final video gap: {msec((newSong.videoGap ?? 0) * 1000)})
                                <InputGroup>
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift - 10)}>
                                        -10
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift - 5)}>
                                        -5
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift - 1)}>
                                        -1
                                    </InputGroupButton>
                                    <InputGroupInput
                                        type="text"
                                        value={videoGapShift}
                                        onChange={(e) => setVideoGapShift(+e.target.value)}
                                        placeholder="Gap shift"
                                    />
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift + 1)}>
                                        +1
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift + 5)}>
                                        +5
                                    </InputGroupButton>
                                    <InputGroupButton onClick={() => setVideoGapShift((shift) => shift + 10)}>
                                        +10
                                    </InputGroupButton>
                                </InputGroup>
                            </EditorRow>
                            {song.tracks.map(({ sections }, index) => {
                                const notesSections = sections.filter(isNotesSection);
                                const firstNote = notesSections[0].notes[0];

                                const lastSection = notesSections[notesSections.length - 1];
                                const lastNote = lastSection.notes[lastSection.notes.length - 1];

                                if (!firstNote || !lastNote  || !beatLength) return null;

                                return (
                                    <EditorRow key={index}>
                                        <strong>Track #{index + 1} - </strong>
                                        Start: {msec(firstNote.start * beatLength + newSong.gap)},
                                        end: {msec(lastNote.start * beatLength + newSong.gap)}
                                    </EditorRow>
                                )
                            })}
                            <EditorRow>
                                <InputGroup>
                                    <span>Desired last note end</span>
                                    <InputGroupInput
                                        type="text"
                                        value={desiredLastNoteEnd}
                                        onChange={(e) => setDesiredLastNoteEnd(+e.target.value)}
                                        placeholder="Desired last note end"
                                    />
                                </InputGroup>
                                Est. proper BPM: <Pre>{calculateProperBPM(desiredLastNoteEnd, newSong)}</Pre>
                            </EditorRow>
                        <a
                            href={`data:application/json;charset=utf-8,${encodeURIComponent(
                                JSON.stringify(newSong, undefined, 2),
                            )}`}
                            download={`${newSong.artist}-${newSong.title}.json`}>
                            Download
                        </a>
                        </Editor>
                        </Preview>
    );
}

const InputGroup = styled.div`
    display: flex;
`;

const InputGroupButton = styled.button`
    flex: 1;
`;

const Pre = styled.span`
    font-family: monospace;
`;

const InputGroupInput = styled.input`
    flex: 1;
    min-width: 100px;
    padding: 3px;
`;

const Editor = styled.div`
    width: 570px;
    margin-left: 20px;
`;

const EditorRow = styled.div`
    margin-bottom: 10px;
`;

const Preview = styled.div`
    display: flex;
`;

const PlayerContainer = styled.div`
    width: ${playerWidth}px;
    height: ${playerHeight}px;
`