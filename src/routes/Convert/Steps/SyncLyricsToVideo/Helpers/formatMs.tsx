import { Button, Tooltip } from '@mui/material';
import { seconds } from 'interfaces';
import GameState from 'modules/GameEngine/GameState/GameState';
import { YouTubePlayer } from 'react-youtube';
import { Pre } from 'routes/Convert/Elements';
import { PlayerRef } from 'routes/Game/Singing/Player';

const formatMs = (msec: number) => {
  const minutes = Math.floor(msec / 1000 / 60);
  const seconds = Math.floor(msec / 1000) - minutes * 60;
  const miliseconds = Math.floor(msec % 1000);

  return (
    <Pre>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}.{String(miliseconds).padStart(3, '0')}
    </Pre>
  );
};

const ytPlayerAdapter = (player: PlayerRef | YouTubePlayer): PlayerRef => {
  if ('playVideo' in player) {
    return {
      play: () => player.playVideo(),
      pause: () => player.pauseVideo(),
      seekTo: (timeSec: seconds) => player.seekTo(timeSec, true),
      setPlaybackSpeed: (rate) => player.setPlaybackRate(rate),
    };
  }

  return player;
};

export const msec = (ms: number | undefined, player?: PlayerRef | YouTubePlayer | null) => (
  <Tooltip title="Click to play the moment just before this time" placement={'top'} arrow>
    <Button
      sx={{ py: 0.15, mb: 0.5 }}
      variant={'contained'}
      size="small"
      disabled={!player}
      onClick={
        player
          ? () => {
              GameState.resetPlayerNotes();
              ytPlayerAdapter(player).seekTo((ms ?? 0) / 1000 - 0.7);
            }
          : undefined
      }>
      {formatMs(ms ?? 0)}
    </Button>
  </Tooltip>
);

export default formatMs;
