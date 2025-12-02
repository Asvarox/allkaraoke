import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export type playerSideType = 'p1' | 'p2' | 'coop';

const playerSideToIndexMap: Record<playerSideType, number> = {
  p1: 0,
  p2: 1,
  coop: 0,
};

export class PostGameResultsPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get skipScoresButton() {
    return this.page.getByTestId('skip-animation-button');
  }

  public async skipScoresAnimation() {
    await this.skipScoresButton.click({ timeout: 20_000 });
  }

  public get nextButton() {
    return this.page.getByTestId('highscores-button');
  }

  public async goToHighScoresStep() {
    await this.nextButton.click();
  }

  public getPlayerScoreElement(playerSide: playerSideType) {
    return this.page.getByTestId(`player-${playerSideToIndexMap[playerSide]}-score`);
  }

  public async expectPlayerScoreToBe(playerSide: playerSideType, expectedScore: string) {
    await expect(this.getPlayerScoreElement(playerSide)).toHaveAttribute('data-score', expectedScore);
  }

  public async expectCoopPlayersScoreToBe(expectedScore: string) {
    await expect(this.getPlayerScoreElement('coop')).toHaveAttribute('data-score', expectedScore);
  }

  public getPlayerNameElement(playerSide: playerSideType) {
    return this.getPlayerScoreElement(playerSide).getByTestId(`player-${playerSideToIndexMap[playerSide]}-name`);
  }

  public async expectPlayerNameToBe(playerSide: playerSideType, playerName: string) {
    await expect(this.getPlayerNameElement(playerSide)).toHaveText(playerName);
  }

  public async expectCoopPlayersNameToBe(playerName_1: string, playerName_2: string) {
    await expect(this.getPlayerNameElement('coop')).toHaveText(`${playerName_1}, ${playerName_2}`);
  }

  public async waitForPlayerScoreToBeGreaterThan(expected: number) {
    await expect(async () => {
      const coopScore = await this.getPlayerScoreElement('p1').getAttribute('data-score');
      expect(parseInt(coopScore!, 10)).toBeGreaterThan(expected);
    }).toPass();
  }
}
