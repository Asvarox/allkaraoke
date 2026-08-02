import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';

import { Pre } from '~/routes/convert/elements';
import ShortcutIndicator from '~/routes/convert/steps/sync-lyrics-to-video/components/shortcut-indicator';
import formatMs from '~/routes/convert/steps/sync-lyrics-to-video/helpers/format-ms';
import { PlayerRef } from '~/routes/game/singing/player';

interface Props {
  player: PlayerRef;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

export default function AdjustPlayback({ player, playbackSpeed, setPlaybackSpeed }: Props) {
  const seekBy = async (bySec: number) => {
    const currentTime = await player.getCurrentTime();
    player.seekTo(((currentTime ?? 0) + bySec) / 1000);
  };

  const currentTimeElementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentTimeElementRef.current) {
        const currentTime = await player.getCurrentTime();
        currentTimeElementRef.current.textContent = `${formatMs(currentTime)}`;
      }
    }, 50);

    return () => clearInterval(interval);
  }, [player]);

  return (
    <div className="flex gap-2">
      <Box>
        <Typography>
          Playback speed: <Pre data-test="current-speed">{playbackSpeed * 100}%</Pre>
        </Typography>
        <ShortcutIndicator shortcutKey="1/2/3/4">
          <ButtonGroup variant="contained" sx={{ display: 'flex', mt: 1 }}>
            {[0.25, 0.5, 1, 2].map((speed) => (
              <Button
                size="small"
                data-test={`speed-${speed}`}
                key={speed}
                sx={{ flex: 1 }}
                onClick={() => {
                  setPlaybackSpeed(speed);
                }}
                disabled={playbackSpeed === speed}>
                {speed * 100}%
              </Button>
            ))}
          </ButtonGroup>
        </ShortcutIndicator>
      </Box>
      <Box>
        <Typography data-test="current-time">
          Time: <Pre ref={currentTimeElementRef} />
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ButtonGroup variant="contained" sx={{ display: 'flex', mt: 1, flex: 1 }}>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(-5_000)} data-test="seek-5s">
              -5
            </Button>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(-500)} data-test="seek-0.5s">
              -0.5
            </Button>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(+500)} data-test="seek+0.5s">
              +0.5
            </Button>
            <Button size="small" sx={{ flex: 1, px: 1 }} onClick={() => seekBy(+5_000)} data-test="seek+5s">
              +5
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </div>
  );
}
