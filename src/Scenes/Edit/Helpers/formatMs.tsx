import { Button, Tooltip } from '@mui/material';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import { PlayerRef } from '../../Game/Singing/Player';
import { Pre } from '../Elements';

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

export const msec = (ms: number | undefined, player: PlayerRef) => (
    <Tooltip title="Click to play the moment just before this time" placement={'top'} arrow>
        <Button
            sx={{ py: 0.15, mb: 0.5 }}
            variant={'contained'}
            size="small"
            onClick={() => {
                GameState.resetPlayerNotes();
                player.seekTo((ms ?? 0) / 1000 - 0.7);
            }}>
            {formatMs(ms ?? 0)}
        </Button>
    </Tooltip>
);

export default formatMs;
