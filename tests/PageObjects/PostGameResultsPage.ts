import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class PostGameResultsPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get skipScoreElement() {
    return this.page.getByTestId('skip-animation-button');
  }

  public async skipScoresAnimation() {
    await this.skipScoreElement.click({ timeout: 20_000 });
  }

  public getPlayerNameElement(playerNumber: number) {
    return this.page.getByTestId(`player-${playerNumber}-name`);
  }

  public async expectPlayerNameToBeDisplayed(playerNumber: number, playerName: string) {
    await expect(this.getPlayerNameElement(playerNumber)).toHaveText(`${playerName}`);
  }

  public get playersNamesCoopElement() {
    return this.page.getByTestId(`player-0-name`);
  }

  public async expectPlayersNamesCoopToBeDisplayed(player1Name: string, player2Name: string) {
    await expect(this.playersNamesCoopElement).toHaveText(`${player1Name}, ${player2Name}`);
  }

  public getPlayerScoreElement(playerNumber: number) {
    return this.page.getByTestId(`player-${playerNumber}-score`);
  }

  public get playersCoopScoreElement() {
    return this.page.getByTestId(`player-0-score`);
  }

  public async waitForPlayersScoreToBeGreaterThan(expected: number) {
    await expect(async () => {
      const p1score = await this.playersCoopScoreElement.getAttribute('data-score');

      expect(parseInt(p1score!, 10)).toBeGreaterThan(expected);
    }).toPass();
  }

  public get nextButton() {
    return this.page.getByTestId('highscores-button');
  }

  public async goToHighScoresStep() {
    await this.nextButton.click();
  }
}
