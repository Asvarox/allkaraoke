import styled from '@emotion/styled';
import { Box, Grid, Typography } from '@mui/material';
import { GAME_MODE, SingSetup, Song } from 'interfaces';
import { cloneDeep } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import AdjustPlayback from 'Scenes/Convert/Steps/SyncLyricsToVideo/Components/AdjustPlayback';
import EditSection, { ChangeRecord } from 'Scenes/Convert/Steps/SyncLyricsToVideo/Components/EditSection';
import ListTracks from 'Scenes/Convert/Steps/SyncLyricsToVideo/Components/ListTracks';
import ManipulateBpm from 'Scenes/Convert/Steps/SyncLyricsToVideo/Components/ManipulateBpm';
import ShiftGap from 'Scenes/Convert/Steps/SyncLyricsToVideo/Components/ShiftGap';
import ShiftVideoGap from 'Scenes/Convert/Steps/SyncLyricsToVideo/Components/ShiftVideoGap';
import addHeadstart from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/addHeadstart';
import normaliseGap from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseGap';
import normaliseLyricSpaces from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseLyricSpaces';
import normaliseSectionPaddings from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseSectionPaddings';
import getSongBeatLength from 'Songs/utils/getSongBeatLength';
import isNotesSection from 'Songs/utils/isNotesSection';
import { getFirstNoteStartFromSections } from 'Songs/utils/notesSelectors';
import Player, { PlayerRef } from 'Scenes/Game/Singing/Player';

interface Props {
    song: Song;
    onUpdate?: (song: Song) => void;
    visible: boolean;
}

const shiftGap = (song: Song, gapShift: number): Song => ({ ...song, gap: song.gap + gapShift });
const shiftVideoGap = (song: Song, gapShift: number): Song => ({ ...song, videoGap: (song.videoGap ?? 0) + gapShift });
const setBpm = (song: Song, bpm: number): Song => ({ ...song, bpm });

const applyChanges = (song: Song, changes: ChangeRecord[]) => ({
    ...song,
    tracks: song.tracks.map((track, trackIndex) => {
        const changeList = changes.filter((change) => change.track === trackIndex);

        let sections = [...track.sections].filter(isNotesSection);

        changeList.forEach((change) => {
            if (change.type === 'delete') {
                sections = sections.filter((_, index) => index !== change.section);
            } else if (change.type === 'shift') {
                const shift = change.shift - getFirstNoteStartFromSections([sections[change.section]]);
                sections = sections.map((section, index) => {
                    if (index < change.section) return section;

                    return { ...section, notes: section.notes.map((note) => ({ ...note, start: note.start + shift })) };
                });
            }
        });

        return { ...track, sections };
    }),
});

const playerWidth = 800;
const playerHeight = (playerWidth / 16) * 9;

export default function EditSong({ song, onUpdate, visible }: Props) {
    const player = useRef<PlayerRef | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);

    const [gapShift, setGapShift] = useState<number>(0);
    const [videoGapShift, setVideoGapShift] = useState<number>(0);
    const [overrideBpm, setOverrideBpm] = useState<number>(song.bpm);
    const [playerKey, setPlayerKey] = useState(0);
    const [changeRecords, setChangeRecords] = useState<ChangeRecord[]>([]);
    const [effectsEnabled, setEffectsEnabled] = useState<boolean>(false);

    const newSong = useMemo(() => {
        let processed = cloneDeep(song);

        processed = normaliseGap(processed);
        processed = addHeadstart(processed);
        processed = normaliseSectionPaddings(processed);
        processed = shiftGap(processed, gapShift);
        processed = shiftVideoGap(processed, videoGapShift);
        processed = setBpm(processed, overrideBpm);
        processed = applyChanges(processed, changeRecords);
        processed = normaliseSectionPaddings(processed);
        processed = normaliseLyricSpaces(processed);

        console.log(processed);

        return processed;
    }, [gapShift, videoGapShift, song, overrideBpm, changeRecords]);

    useEffect(() => {
        onUpdate?.(newSong);
    }, [onUpdate, newSong]);

    const singSetup = useMemo<SingSetup>(
        () => ({
            id: 'test',
            mode: GAME_MODE.DUEL,
            players: [
                { name: 'Player 1', track: 0 },
                { name: 'Player 2', track: song.tracks.length - 1 },
            ],
            tolerance: 6,
        }),
        [song],
    );

    let beatLength: number | undefined;

    beatLength = getSongBeatLength(newSong);

    return (
        <Grid container spacing={2} sx={{ display: visible ? undefined : 'none' }}>
            <Grid item xs={8} data-test="player-container">
                <Box sx={{ width: playerWidth, height: playerHeight }}>
                    <Player
                        key={playerKey}
                        song={newSong}
                        showControls
                        autoplay={false}
                        width={playerWidth}
                        height={playerHeight}
                        ref={player}
                        onTimeUpdate={setCurrentTime}
                        players={[
                            { name: 'p1', track: 0 },
                            { name: 'p1', track: song.tracks.length - 1 },
                        ]}
                        effectsEnabled={effectsEnabled}
                        singSetup={singSetup}
                        onSongEnd={() => undefined}
                    />
                </Box>
            </Grid>
            <Grid item xs={4}>
                <Typography variant={'h5'} mb={2}>
                    Playback controls
                </Typography>
                {player.current && (
                    <AdjustPlayback
                        player={player.current}
                        currentTime={currentTime}
                        effectsEnabled={effectsEnabled}
                        onEffectsToggle={() => setEffectsEnabled((current) => !current)}
                    />
                )}
                {!player.current && <h2>Start the song to see the manipulation form</h2>}
            </Grid>
            {player.current && (
                <>
                    <Grid item xs={8}>
                        {/*<Typography variant={'h5'} mb={2}>*/}
                        {/*    Basic adjustments*/}
                        {/*</Typography>*/}
                        <Box sx={{ display: 'flex', gap: 5, flex: 1 }}>
                            <ShiftVideoGap
                                player={player.current}
                                onChange={setVideoGapShift}
                                current={videoGapShift}
                                finalGap={newSong.videoGap}
                            />
                            <ShiftGap
                                player={player.current}
                                onChange={setGapShift}
                                current={gapShift}
                                finalGap={newSong.gap}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <HelpText>
                            Use <strong>Video shift gap</strong> to crop the beginning of the video if it starts with an
                            intro.
                        </HelpText>
                        <HelpText>
                            Use <strong>Shift gap</strong> to sync the start of the lyrics to the video. You can lower
                            the <strong>Playback speed</strong> above to make sure you got it just right.
                        </HelpText>
                    </Grid>
                    <Grid item xs={8}>
                        <Typography variant={'h5'} mb={2}>
                            Advanced
                        </Typography>
                        <ManipulateBpm
                            player={player.current}
                            onChange={setOverrideBpm}
                            current={overrideBpm}
                            song={newSong}
                            key={newSong.gap}
                        />
                        <ListTracks player={player.current} song={newSong} beatLength={beatLength} />
                    </Grid>
                    <Grid item xs={4}>
                        <HelpText>
                            If the lyrics desynchronise over time, probably the tempo (BPM) of the lyrics is wrong.
                        </HelpText>
                        <HelpText>
                            You can either use <strong>Last note end time</strong> - enter the millisecond when the last
                            note should end (seek through the video for the moment as <strong>Current time</strong>{' '}
                            panel show the exact millisecond) and a suggested BPM value will appear below.
                        </HelpText>
                        <HelpText>
                            <strong>Tempo (BPM)</strong> field allows to fine-tune the tempo.
                        </HelpText>
                    </Grid>
                    <Grid item xs={8}>
                        <EditSection
                            song={newSong}
                            currentTime={currentTime}
                            beatLength={beatLength}
                            player={player.current}
                            onChange={setChangeRecords}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <HelpText>
                            If the lyrics there are more lyrics than in the video or there are longer/shorter interludes
                            between verses, you can <strong>Edit verses</strong>.
                        </HelpText>
                        <HelpText>Select a verse by clicking on it.</HelpText>
                        <HelpText>
                            You can either <strong>Change its start beat</strong> (which will "move in time" the verse
                            and all subsequent ones) or <strong>Delete it</strong> (it won't affect the timing of other
                            verses).
                        </HelpText>
                        <HelpText>
                            <strong>List of changes</strong> on the right allows you to see and undo the actions one by
                            one.
                        </HelpText>
                    </Grid>
                </>
            )}
        </Grid>
    );
}

const HelpText = styled.p`
    font-size: 0.85em;
    margin-bottom: 1em;
    line-height: 1.25em;
    strong {
        font-weight: bold;
    }
`;
