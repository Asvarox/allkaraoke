import { Button, TextField } from '@mui/material';
import { useState } from 'react';
import { Song } from '~/interfaces';
import beatToMs from '~/modules/GameEngine/GameState/Helpers/beatToMs';
import { getLastNoteEndFromSections } from '~/modules/Songs/utils/notesSelectors';
import { Pre } from '~/routes/Convert/Elements';
import calculateProperBPM from '~/routes/Convert/calculateProperBpm';
import ShortcutIndicator from './ShortcutIndicator';

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
    <div className="mb-2 flex items-start gap-2">
      <TextField
        data-test="desired-end"
        size={'small'}
        type="number"
        value={desiredLastNoteEnd}
        onChange={(e) => setDesiredLastNoteEnd(+e.target.value)}
        label="Target last note end time (ms)"
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
      <div className="flex flex-1">
        {/*<IconButton aria-label="decrease tempo" size="small" onClick={() => onChange(current - 0.1)}>*/}
        {/*  <Remove />*/}
        {/*</IconButton>*/}
        <ShortcutIndicator shortcutKey={'z'}>
          <Button
            sx={{ minWidth: '40px', width: '40px' }}
            variant="contained"
            size="small"
            onClick={() => onChange(current - 0.1)}>
            -
          </Button>
        </ShortcutIndicator>
        <TextField
          data-test="change-bpm"
          size={'small'}
          type="number"
          value={current}
          onChange={(e) => !isNaN(+e.target.value) && onChange(+e.target.value)}
          label="Tempo (BPM) of the lyrics"
          sx={{ flex: 1 }}
          InputProps={{
            inputProps: {
              step: '0.1',
            },
          }}
        />
        <ShortcutIndicator shortcutKey={'w'}>
          <Button
            variant="contained"
            size="small"
            sx={{ minWidth: '40px', width: '40px' }}
            onClick={() => onChange(current + 0.1)}>
            +
          </Button>
        </ShortcutIndicator>
      </div>
    </div>
  );
}
