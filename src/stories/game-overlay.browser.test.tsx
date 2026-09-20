import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

import { GAME_MODE } from '~/interfaces';
import GameState from '~/modules/game-engine/game-state/game-state';

import { GameOverlayStory } from './game-overlay.stories';

const addStyle = (content: string) => {
  const style = document.createElement('style');
  style.textContent = content;
  document.head.append(style);

  return style;
};

let styles: HTMLStyleElement[] = [];

beforeEach(async () => {
  await page.viewport(1280, 720);
  vi.spyOn(Math, 'random').mockReturnValue(0.75);
  // All tests in a file share one page - a game left "playing" by the previous test blocks the story from
  // changing the players
  GameState.resetSingSetup();
});

afterEach(() => {
  styles.forEach((style) => style.remove());
  styles = [];
  vi.restoreAllMocks();
});

test.each([1, 2, 3, 4])('should properly draw the game with %i player(s)', async (playerNum) => {
  const screen = await render(
    <GameOverlayStory.render playerNum={playerNum} tolerance={6} gameMode={GAME_MODE.DUEL} speed={100} progress={35} />,
  );

  // The actual fonts break the snapshot tests, so we replace them with Arial
  styles.push(addStyle('* { font-family: Arial !important; }'));

  await new Promise((resolve) => setTimeout(resolve, 500));

  await expect
    .element(page.elementLocator(screen.container.firstElementChild!))
    .toMatchScreenshot(`game-${playerNum}-players`, { comparatorOptions: { allowedMismatchedPixelRatio: 0.01 } });

  // Hide the font to make comparison easier
  styles.push(addStyle('* { color: transparent !important; -webkit-text-stroke: 0 black !important; }'));

  await expect
    .element(screen.getByTestId('lyrics-container-player-0').first())
    .toMatchScreenshot(`lyrics-${playerNum}-players`, { comparatorOptions: { allowedMismatchedPixelRatio: 0.03 } });
});
