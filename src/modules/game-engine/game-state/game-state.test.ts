import { describe, expect, it } from 'vitest';

import { GameStateClass } from '~/modules/game-engine/game-state/game-state';
import { mulitrack } from '~/modules/songs/utils/song-fixture';

describe('GameState duration', () => {
  it("doesn't carry the previous song's video length over to the next song", () => {
    const gameState = new GameStateClass();
    gameState.setSong(mulitrack);
    gameState.setDuration(213);

    gameState.setSong({ ...mulitrack, id: 'other-song' });

    expect(gameState.getDuration()).toBe(0);
  });

  it('keeps the length when the same song is set again', () => {
    const gameState = new GameStateClass();
    gameState.setSong(mulitrack);
    gameState.setDuration(213);

    gameState.setSong({ ...mulitrack });

    expect(gameState.getDuration()).toBe(213);
  });
});
