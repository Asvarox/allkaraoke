import PlayersManager from 'Players/PlayersManager';
import CanvasDrawing from 'Scenes/Game/Singing/GameOverlay/Drawing/CanvasDrawing';
import { drawSprite, getSprite } from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/Cache/cachedSprites';
import drawPlayerNote from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/playerNote';
import roundRect from 'Scenes/Game/Singing/GameOverlay/Drawing/Elements/roundRect';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import beatToMs from 'Scenes/Game/Singing/GameState/Helpers/beatToMs';
import DrawingTestInput from 'Scenes/Game/Singing/Input/DrawingTestInput';
import { mulitrack } from 'Songs/utils/song-fixture';
import { GAME_MODE } from 'interfaces';
import { useEffect } from 'react';
import pitchToFrequency from 'utils/pitchToFrequency';

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
                { number: 0, track: 0 },
                { number: 1, track: 1 },
            ],
            mode: GAME_MODE.DUEL,
            tolerance: 2,
        });

        PlayersManager.getPlayer(0).changeInput('DrawingTest', 0);
        PlayersManager.getPlayer(1).changeInput('DrawingTest', 1);
    }, []);

    return <canvas width={props.width} height={props.height} id={'canvas'} />;
};
