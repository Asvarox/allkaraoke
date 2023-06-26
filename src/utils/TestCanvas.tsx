import { useEffect } from 'react';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import { GAME_MODE } from 'interfaces';
import CanvasDrawing from 'Scenes/Game/Singing/GameOverlay/Drawing/CanvasDrawing';
import DrawingTestInput from 'Scenes/Game/Singing/Input/DrawingTestInput';
import { mulitrack } from 'Songs/utils/song-fixture';
import drawPlayerNote from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/playerNote';
import roundRect from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/roundRect';
import { drawSprite, getSprite } from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/cachedSprites';
import pitchToFrequency from 'utils/pitchToFrequency';
import beatToMs from 'Scenes/Game/Singing/GameState/Helpers/beatToMs';
import PlayersManager from 'PlayersManager';

// Add needed stuff here
const CanvasTestApi = {
    utils: {
        pitchToFrequency,
        beatToMs,
    },
    Elements: {
        drawPlayerNote: drawPlayerNote,
        roundRect: roundRect,
        drawSprite: drawSprite,
        getSprite: getSprite,
    },
    GameState,
    DrawingTestInput,
    CanvasDrawing,
};

window.CanvasTestApi = CanvasTestApi;

declare global {
    interface Window {
        CanvasTestApi: typeof CanvasTestApi;
    }
}

interface Props {
    width: number;
    height: number;
}
export const TestCanvas = (props: Props) => {
    useEffect(() => {
        GameState.setSong(mulitrack);
        GameState.setSingSetup({
            id: 'tests',
            players: [
                { name: 'Player 1', track: 0 },
                { name: 'Player 2', track: 1 },
            ],
            mode: GAME_MODE.DUEL,
            tolerance: 2,
        });

        PlayersManager.getPlayer(0).changeInput('DrawingTest', 0);
        PlayersManager.getPlayer(1).changeInput('DrawingTest', 1);
    }, []);

    return <canvas width={props.width} height={props.height} id={'canvas'} />;
};
