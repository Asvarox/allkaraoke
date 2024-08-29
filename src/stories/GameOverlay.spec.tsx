import { expect, test } from '@playwright/experimental-ct-react';
import { GAME_MODE } from 'interfaces';
import { GameOverlayStory } from './GameOverlay.stories';

// This is the way https://playwright.dev/docs/test-parameterize#parameterized-tests
const playerNums = [1, 2, 3, 4];
for (const playerNum of playerNums) {
  test(`should properly draw the game with ${playerNum} player(s)`, async ({ mount, page }) => {
    const component = await mount(
      <GameOverlayStory.render
        playerNum={playerNum}
        tolerance={6}
        gameMode={GAME_MODE.DUEL}
        speed={100}
        progress={35}
      />,
    );

    // The actual fonts break the snapshot tests, so we replace them with Arial
    await page.addStyleTag({
      content: `
      * {
    font-family: Arial !important;
    }
      `,
    });

    await page.waitForTimeout(500);

    await page.evaluate(() => {
      window.__exposeSingletons();
      window.Math.random = () => 0.75;
    });

    expect(await component.screenshot()).toMatchSnapshot({ maxDiffPixelRatio: 0.01 });

    // Hide the font to make comparison easier
    await page.addStyleTag({
      content: `
      * {
      color: transparent !important;
  -webkit-text-stroke: 0 black !important;
    }
      `,
    });

    expect(await component.getByTestId(`lyrics-container-player-0`).first().screenshot()).toMatchSnapshot({
      maxDiffPixelRatio: 0.03,
    });
  });
}
