import { Box, Button, ButtonGroup, TextField, Typography } from '@mui/material';
import { msec } from 'routes/Convert/Steps/SyncLyricsToVideo/Helpers/formatMs';
import { PlayerRef } from 'routes/Game/Singing/Player';

interface Props {
  onChange: (shift: number) => void;
  current: number;
  player: PlayerRef;
  finalGap: number;
}

export default function ShiftGap({ current, onChange, player, finalGap }: Props) {
  return (
    <Box flex="1">
      <Typography>Lyrics Gap shift (final: {msec(finalGap, player)})</Typography>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <ButtonGroup sx={{ flex: 1 }}>
          <Button sx={{ flex: 1, px: 1 }} onClick={() => onChange(current - 1000)} data-test="shift-gap-1s">
            -1000
          </Button>
          <Button sx={{ flex: 1, px: 1 }} onClick={() => onChange(current - 500)} data-test="shift-gap-0.5s">
            -500
          </Button>
          <Button sx={{ flex: 1, px: 1 }} onClick={() => onChange(current - 50)} data-test="shift-gap-0.05s">
            -50
          </Button>
        </ButtonGroup>
        <TextField
          sx={{ py: 0, flex: 1 }}
          size={'small'}
          type="text"
          value={current}
          onChange={(e) => onChange(+e.target.value)}
          label="Miliseconds"
          data-test="shift-gap"
        />
        <ButtonGroup sx={{ flex: 1 }}>
          <Button sx={{ flex: 1, px: 1 }} onClick={() => onChange(current + 50)} data-test="shift-gap+0.05s">
            +50
          </Button>
          <Button sx={{ flex: 1, px: 1 }} onClick={() => onChange(current + 500)} data-test="shift-gap+0.5s">
            +500
          </Button>
          <Button sx={{ flex: 1, px: 1 }} onClick={() => onChange(current + 1000)} data-test="shift-gap+1s">
            +1000
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
}
