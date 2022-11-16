import { Box, TextField } from '@mui/material';
import { Song } from 'interfaces';
import { useState } from 'react';
import beatToMs from 'Scenes/Game/Singing/GameState/Helpers/beatToMs';
import { getLastNoteEndFromSections } from 'Scenes/Game/Singing/Helpers/notesSelectors';
import calculateProperBPM from '../../Convert/calculateProperBpm';
import { PlayerRef } from '../../Game/Singing/Player';
import { Pre } from '../Elements';

interface Props {
    onChange: (bpm: number) => void;
    current: number;
    player: PlayerRef;
    song: Song;
}

export default function ManipulateBpm({ current, onChange, player, song }: Props) {
    const lastNoteEndBeat = Math.max(...song.tracks.map((track) => getLastNoteEndFromSections(track.sections)));
    const lastNoteEndMs = beatToMs(lastNoteEndBeat, song) + song.gap;
    const [desiredLastNoteEnd, setDesiredLastNoteEnd] = useState<number>(Math.round(lastNoteEndMs));

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
                size={'small'}
                type="text"
                value={desiredLastNoteEnd}
                onChange={(e) => setDesiredLastNoteEnd(+e.target.value)}
                label="Desired last note end time (in milliseconds)"
                sx={{ flex: 1 }}
                helperText={
                    !!desiredLastNoteEnd ? (
                        <>
                            Est. proper Tempo (BPM): <Pre>{calculateProperBPM(desiredLastNoteEnd, song)}</Pre>
                        </>
                    ) : (
                        ' '
                    )
                }
            />
            <TextField
                size={'small'}
                type="number"
                value={current}
                onChange={(e) => onChange(+e.target.value)}
                label="Tempo (BPM) of the lyrics"
                sx={{ flex: 0.5 }}
                helperText={' '}
                InputProps={{
                    inputProps: {
                        step: '0.1',
                    },
                }}
            />
        </Box>
    );
}
