import { Box, Button, ButtonGroup, TextField, Typography } from '@mui/material';
import { milliseconds } from 'interfaces';
import { msec } from 'routes/Convert/Steps/SyncLyricsToVideo/Helpers/formatMs';
import { PlayerRef } from 'routes/Game/Singing/Player';
import ShortcutIndicator from './ShortcutIndicator';

interface Props {
  onChange: (shift: string) => void;
  current: string;
  player: PlayerRef;
  finalGap: number;
}

export default function ShiftGap({ current, onChange, player, finalGap }: Props) {
  const changeBy = (value: milliseconds) => {
    const newValue = String(Number(current) + value);
    onChange(newValue);
  };

  return (
    <Box flex="1">
      <Typography>Lyrics Gap shift (final: {msec(finalGap, player)})</Typography>
      <div className="mt-1 flex gap-1">
        <ButtonGroup sx={{ flex: 1 }}>
          <Button sx={{ flex: 1, px: 1 }} onClick={() => changeBy(-1000)} data-test="shift-gap-1s">
            -1000
          </Button>
          <Button sx={{ flex: 1, px: 1 }} onClick={() => changeBy(-500)} data-test="shift-gap-0.5s">
            -500
          </Button>
          <ShortcutIndicator shortcutKey="a">
            <Button sx={{ flex: 1, px: 1 }} onClick={() => changeBy(-50)} data-test="shift-gap-0.05s">
              -50
            </Button>
          </ShortcutIndicator>
        </ButtonGroup>
        <TextField
          sx={{ py: 0, flex: 1 }}
          size={'small'}
          type="text"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          label="Miliseconds"
          data-test="shift-gap"
        />
        <ButtonGroup sx={{ flex: 1 }}>
          <ShortcutIndicator shortcutKey="s">
            <Button sx={{ flex: 1, px: 1 }} onClick={() => changeBy(50)} data-test="shift-gap+0.05s">
              +50
            </Button>
          </ShortcutIndicator>
          <Button sx={{ flex: 1, px: 1 }} onClick={() => changeBy(500)} data-test="shift-gap+0.5s">
            +500
          </Button>
          <Button sx={{ flex: 1, px: 1 }} onClick={() => changeBy(1000)} data-test="shift-gap+1s">
            +1000
          </Button>
        </ButtonGroup>
      </div>
    </Box>
  );
}
