import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Song } from '../../interfaces';
import getSongBeatLength from '../Game/Singing/Helpers/getSongBeatLength';
import Player, { PlayerRef } from '../Game/Singing/Player';

import { cloneDeep } from 'lodash';
import normaliseGap from './Helpers/normaliseGap';
import normaliseSectionPaddings from './Helpers/normaliseSectionPaddings';
import AdjustPlayback from './Components/AdjustPlayback';
import ShiftGap from './Components/ShiftGap';
import ShiftVideoGap from './Components/ShiftVideoGap';
import ListTracks from './Components/ListTracks';
import ManipulateBpm from './Components/ManipulateBpm';
import EditSection, { ChangeRecord } from './Components/EditSection';
import isNotesSection from '../Game/Singing/Helpers/isNotesSection';
import { getFirstNoteStartFromSections } from '../Game/Singing/Helpers/notesSelectors';

interface Props {
    song: Song;
    onUpdate?: (song: Song) => void;
}

const shiftGap = (song: Song, gapShift: number): Song => ({ ...song, gap: song.gap + gapShift });
const shiftVideoGap = (song: Song, gapShift: number): Song => ({ ...song, videoGap: (song.videoGap ?? 0) + gapShift });
const setBpm = (song: Song, bpm: number): Song => ({ ...song, bpm });

const applyChanges = (song: Song, changes: ChangeRecord[]) => ({
    ...song,
    tracks: song.tracks.map((track, trackIndex) => {
        const changeList = changes.filter(change => change.track === trackIndex);

        let sections = [...track.sections].filter(isNotesSection);

        changeList.forEach(change => {
            if (change.type === 'delete') {
                sections = sections.filter((_, index) => index !== change.section);
            } else if (change.type === 'shift') {
                const shift = change.shift - getFirstNoteStartFromSections([sections[change.section]])
                sections = sections.map((section, index) => {
                    if (index < change.section) return section;

                    return { ...section, notes: section.notes.map(note => ({ ...note, start: note.start + shift }))};
                })
            }
        });

        return { ...track, sections };
    })
})

const playerWidth = 850;
const playerHeight = (700 / 16) * 9;

export default function EditSong({ song, onUpdate }: Props) {
    const player = useRef<PlayerRef | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);

    const [gapShift, setGapShift] = useState<number>(0);
    const [videoGapShift, setVideoGapShift] = useState<number>(0);
    const [overrideBpm, setOverrideBpm] = useState<number>(song.bpm);
    const [playerKey, setPlayerKey] = useState(0);
    const [changeRecords, setChangeRecords] = useState<ChangeRecord[]>([]);

    const newSong = useMemo(() => {
        let processed = cloneDeep(song);

        processed = normaliseGap(processed);
        processed = normaliseSectionPaddings(processed);
        processed = shiftGap(processed, gapShift);
        processed = shiftVideoGap(processed, videoGapShift);
        processed = setBpm(processed, overrideBpm);
        processed = applyChanges(processed, changeRecords);
        processed = normaliseSectionPaddings(processed);

        return processed;
    }, [gapShift, videoGapShift, song, overrideBpm, changeRecords]);

    useEffect(() => {
        onUpdate?.(newSong);
    }, [gapShift, videoGapShift, overrideBpm, changeRecords]);

    let beatLength: number | undefined;

    beatLength = getSongBeatLength(newSong);

    return (
        <Container>
            <Preview>
                <PlayerContainer>
                    <Player
                        key={playerKey}
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
                    {player.current && (
                        <>
                            <AdjustPlayback player={player.current} currentTime={currentTime} />
                            <ShiftGap
                                player={player.current}
                                onChange={setGapShift}
                                current={gapShift}
                                finalGap={newSong.gap}
                            />
                            <ShiftVideoGap
                                player={player.current}
                                onChange={setVideoGapShift}
                                current={videoGapShift}
                                finalGap={newSong.videoGap}
                            />
                            <ListTracks player={player.current} song={newSong} beatLength={beatLength} />
                            <ManipulateBpm
                                player={player.current}
                                onChange={setOverrideBpm}
                                current={overrideBpm}
                                song={newSong}
                            />
                        </>
                    )}
                    {!player.current && <h2>Start the song to see the manipulation form</h2>}
                    <a
                        href={`data:application/json;charset=utf-8,${encodeURIComponent(
                            JSON.stringify(newSong, undefined, 2),
                        )}`}
                        download={`${newSong.artist}-${newSong.title}.json`}>
                        Download
                    </a>
                    <button onClick={() => setPlayerKey(Date.now())}>reset player</button>
                </Editor>
            </Preview>
            {player.current && (
                <EditSection song={newSong} currentTime={currentTime} beatLength={beatLength} player={player.current} onChange={setChangeRecords} />
            )}
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const Editor = styled.div`
    width: 500px;
    margin-left: 20px;
`;

const Preview = styled.div`
    display: flex;
`;

const PlayerContainer = styled.div`
    width: ${playerWidth}px;
    height: ${playerHeight}px;
`;
