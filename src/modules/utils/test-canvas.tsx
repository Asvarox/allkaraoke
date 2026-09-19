import { useEffect } from 'react';

import { GAME_MODE } from '~/interfaces';
import GameState from '~/modules/game-engine/game-state/game-state';
import PlayersManager from '~/modules/players/players-manager';
import { mulitrack } from '~/modules/songs/utils/song-fixture';

export interface Props {
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
