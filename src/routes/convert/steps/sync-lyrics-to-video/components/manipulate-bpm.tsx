import { AccessTime } from '@mui/icons-material';
import { Button, TextField, Tooltip } from '@mui/material';
import { useState } from 'react';

import { Song } from '~/interfaces';
import beatToMs from '~/modules/game-engine/game-state/helpers/beat-to-ms';
import { getLastNoteEndFromSections } from '~/modules/songs/utils/notes-selectors';
import calculateProperBPM from '~/routes/convert/calculate-proper-bpm';
import { Pre } from '~/routes/convert/elements';

import ShortcutIndicator from './shortcut-indicator';

interface Props {
  onChange: (bpm: number) => void;
  onUseCurrentTime: () => Promise<number>;
  current: number;
  song: Song;
}

export default function ManipulateBpm({ current, onChange, onUseCurrentTime, song }: Props) {
  const lastNoteEndBeat = Math.max(...song.tracks.map((track) => getLastNoteEndFromSections(track.sections)));
  const lastNoteEndMs = beatToMs(lastNoteEndBeat, song) + song.gap;
  const [desiredLastNoteEnd, setDesiredLastNoteEnd] = useState<number>(Math.round(lastNoteEndMs));
  const estimatedBpm = desiredLastNoteEnd ? calculateProperBPM(desiredLastNoteEnd, song) : undefined;

  const setDesiredLastNoteEndToCurrentPlayerTime = async () => {
    setDesiredLastNoteEnd(Math.round(await onUseCurrentTime()));
  };

  const applyEstimatedBpm = () => {
    if (estimatedBpm && !isNaN(estimatedBpm)) {
      onChange(estimatedBpm);
    }
  };

  return (
    <div className="mb-2 flex flex-col items-stretch gap-6 md:flex-row md:gap-2">
      <TextField
        data-test="desired-end"
        size={'small'}
        type="number"
        value={desiredLastNoteEnd}
        onChange={(e) => setDesiredLastNoteEnd(+e.target.value)}
        label="Target last note end time (ms)"
        sx={{ flex: 1 }}
        slotProps={{
          input: {
            endAdornment: (
              <Tooltip title="Use the current player time">
                <Button
                  data-test="desired-end-current-time"
                  endIcon={<AccessTime />}
                  color="secondary"
                  variant="text"
                  onClick={setDesiredLastNoteEndToCurrentPlayerTime}>
                  Current
                </Button>
              </Tooltip>
            ),
          },
        }}
        helperText={
          !!desiredLastNoteEnd ? (
            <>
              Estimated proper Tempo (BPM) of the lyrics:{' '}
              <Button
                data-test="desired-bpm"
                size="small"
                color="secondary"
                variant="text"
                onClick={applyEstimatedBpm}
                sx={{ minWidth: 0, p: 0, verticalAlign: 'baseline' }}>
                <Pre>{estimatedBpm}</Pre>
              </Button>
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
          slotProps={{
            htmlInput: {
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
