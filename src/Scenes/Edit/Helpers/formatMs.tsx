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
    <button onClick={() => player.seekTo((ms ?? 0) / 1000 - 1)}>{formatMs(ms ?? 0)}</button>
);

export default formatMs;
