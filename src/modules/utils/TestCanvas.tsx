import { useEffect } from 'react';
import { GAME_MODE } from '~/interfaces';
import CanvasDrawing from '~/modules/GameEngine/Drawing/CanvasDrawing';
import { drawSprite, getSprite } from '~/modules/GameEngine/Drawing/Elements/Cache/cachedSprites';
import drawPlayerNote from '~/modules/GameEngine/Drawing/Elements/playerNote';
import roundRect from '~/modules/GameEngine/Drawing/Elements/roundRect';
import GameState from '~/modules/GameEngine/GameState/GameState';
import beatToMs from '~/modules/GameEngine/GameState/Helpers/beatToMs';
import DrawingTestInput from '~/modules/GameEngine/Input/DrawingTestInput';
import PlayersManager from '~/modules/Players/PlayersManager';
import { mulitrack } from '~/modules/Songs/utils/song-fixture';
import pitchToFrequency from '~/modules/utils/pitchToFrequency';

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

global.canvasTestApi = CanvasTestApi;

declare global {
  var canvasTestApi: typeof CanvasTestApi;
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

    // @ts-expect-error DrawingTest is only-for-test input and is not included in the typings
    PlayersManager.getPlayer(0)!.changeInput('DrawingTest', 0);
    // @ts-expect-error DrawingTest is only-for-test input and is not included in the typings
    PlayersManager.getPlayer(1)!.changeInput('DrawingTest', 1);
  }, []);

  return <canvas width={props.width} height={props.height} id={'canvas'} />;
};
