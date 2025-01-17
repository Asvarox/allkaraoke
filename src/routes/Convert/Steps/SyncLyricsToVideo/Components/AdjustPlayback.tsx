import { Box, Button, ButtonGroup, Divider, Typography } from '@mui/material';
import { Pre } from 'routes/Convert/Elements';
import formatMs from 'routes/Convert/Steps/SyncLyricsToVideo/Helpers/formatMs';
import { PlayerRef } from 'routes/Game/Singing/Player';

interface Props {
  player: PlayerRef;
  currentTime: number;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

export default function AdjustPlayback({ player, currentTime, playbackSpeed, setPlaybackSpeed }: Props) {
  const seekBy = (bySec: number) => player.seekTo((currentTime + bySec) / 1000);

  return (
    <>
      <Box>
        <Typography data-test="current-time">
          Current time: {formatMs(currentTime)} (<Pre>{Math.round(currentTime)}</Pre> ms)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ButtonGroup variant="contained" sx={{ display: 'flex', mt: 1, flex: 1 }}>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(-10_000)} data-test="seek-10s">
              -10
            </Button>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(-5_000)} data-test="seek-5s">
              -5
            </Button>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(-1_000)} data-test="seek-1s">
              -1
            </Button>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(-500)} data-test="seek-0.5s">
              -0.5
            </Button>
          </ButtonGroup>
          <Divider />
          <ButtonGroup variant="contained" sx={{ display: 'flex', mt: 1, flex: 1 }}>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(+500)} data-test="seek+0.5s">
              +0.5
            </Button>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(+1_000)} data-test="seek+1s">
              +1
            </Button>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(+5_000)} data-test="seek+5s">
              +5
            </Button>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(+10_000)} data-test="seek+10s">
              +10
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
      <Box>
        <Typography>
          Playback speed: <Pre data-test="current-speed">{playbackSpeed * 100}%</Pre>
        </Typography>
        <ButtonGroup variant="contained" sx={{ display: 'flex', mt: 1 }}>
          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
            <Button
              size="small"
              data-test={`speed-${speed}`}
              key={speed}
              sx={{ flex: 1 }}
              onClick={() => {
                setPlaybackSpeed(speed);
                player.setPlaybackSpeed(speed);
              }}
              disabled={playbackSpeed === speed}>
              {speed * 100}%
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </>
  );
}
