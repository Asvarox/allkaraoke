import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class PostGamePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public async expectPlayerNameToBeDisplayed(playerNumber: number, playerName: string) {
    await expect(this.page.getByTestId(`player-${playerNumber}-name`)).toHaveText(`${playerName}`);
  }

  public get skipScoreElement() {
    return this.page.getByTestId('skip-animation-button');
  }

  public async skipScoresAnimation() {
    await this.skipScoreElement.click({ timeout: 20_000 });
  }

  public async goNext() {
    await this.page.getByTestId('highscores-button').click();
  }

  public getEditPlayerNameHighscoreInput(playerName: string) {
    return this.page.locator(`[data-test="input-edit-highscore"][data-original-name="${playerName}"]`);
  }

  public async expectPlayerNameToBeVisibleOnHighscoreList(playerName: string) {
    await expect(this.getEditPlayerNameHighscoreInput(playerName)).toBeVisible();
  }

  public async navigateAndUpdateHighestScorePlayerNameByKeyboard(newName: string) {
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.type(`${newName}`);
    await this.page.keyboard.press('Enter');
    await this.page.keyboard.press('ArrowUp');
    await this.page.waitForTimeout(500); // It takes 300ms to save the score
  }

  public get highscoresContainer() {
    return this.page.getByTestId('highscores-container');
  }

  public async goToSelectNewSong() {
    await this.page.getByTestId('play-next-song-button').click();
  }
}
