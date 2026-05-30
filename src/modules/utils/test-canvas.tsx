import { useEffect } from 'react';
import { GAME_MODE } from '~/interfaces';
import CanvasDrawing from '~/modules/game-engine/drawing/canvas-drawing';
import { drawSprite, getSprite } from '~/modules/game-engine/drawing/elements/cache/cached-sprites';
import drawPlayerNote from '~/modules/game-engine/drawing/elements/player-note';
import roundRect from '~/modules/game-engine/drawing/elements/round-rect';
import GameState from '~/modules/game-engine/game-state/game-state';
import beatToMs from '~/modules/game-engine/game-state/helpers/beat-to-ms';
import DrawingTestInput from '~/modules/game-engine/input/drawing-test-input';
import PlayersManager from '~/modules/players/players-manager';
import { mulitrack } from '~/modules/songs/utils/song-fixture';
import pitchToFrequency from '~/modules/utils/pitch-to-frequency';

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
