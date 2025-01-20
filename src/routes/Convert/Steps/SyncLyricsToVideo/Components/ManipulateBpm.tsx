import { Box, TextField } from '@mui/material';
import { Song } from 'interfaces';
import beatToMs from 'modules/GameEngine/GameState/Helpers/beatToMs';
import { getLastNoteEndFromSections } from 'modules/Songs/utils/notesSelectors';
import { useState } from 'react';
import { Pre } from 'routes/Convert/Elements';
import calculateProperBPM from 'routes/Convert/calculateProperBpm';

interface Props {
  onChange: (bpm: number) => void;
  current: number;
  song: Song;
}

export default function ManipulateBpm({ current, onChange, song }: Props) {
  const lastNoteEndBeat = Math.max(...song.tracks.map((track) => getLastNoteEndFromSections(track.sections)));
  const lastNoteEndMs = beatToMs(lastNoteEndBeat, song) + song.gap;
  const [desiredLastNoteEnd, setDesiredLastNoteEnd] = useState<number>(Math.round(lastNoteEndMs));

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        data-test="desired-end"
        size={'small'}
        type="number"
        value={desiredLastNoteEnd}
        onChange={(e) => setDesiredLastNoteEnd(+e.target.value)}
        label="Desired last note end time (in milliseconds)"
        sx={{ flex: 1 }}
        helperText={
          !!desiredLastNoteEnd ? (
            <>
              Estimated proper Tempo (BPM) of the lyrics:{' '}
              <Pre data-test="desired-bpm">{calculateProperBPM(desiredLastNoteEnd, song)}</Pre>
            </>
          ) : (
            ' '
          )
        }
      />
      <TextField
        data-test="change-bpm"
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
