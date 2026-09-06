import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class PostGameHighScoresPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public getPlayerNameInput(playerName: string) {
    return this.page.locator(`[data-test="input-edit-highscore"][data-original-name="${playerName}"]`);
  }

  public getPlayersNamesCoopInput(player1Name: string, player2Name: string) {
    return this.page.locator(`[data-test="input-edit-highscore"][data-original-name="${player1Name}, ${player2Name}"]`);
  }

  public async navigateAndUpdateHighestScorePlayerNameByKeyboard(newName: string) {
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.type(`${newName}`);
    await this.page.keyboard.press('Enter');
    await this.page.keyboard.press('ArrowUp');
    await this.page.waitForTimeout(500); // It takes 300ms to save the score
  }

  public get highScoresContainer() {
    return this.page.getByTestId('highscores-container');
  }

  /**
   * The leaderboard share prompt now greets every qualifying score on the high-scores step. Specs
   * that are not about the leaderboard decline it to get at the panel underneath. A no-op when the
   * score did not qualify or the player already answered the prompt in an earlier run.
   */
  public async dismissLeaderboardPrompt() {
    await this.highScoresContainer.waitFor();
    const prompt = this.page.getByTestId('leaderboard-prompt');
    try {
      await prompt.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      return;
    }
    await this.page.getByTestId('leaderboard-decline').click();
    await expect(prompt).not.toBeVisible();
  }

  public get selectSongButton() {
    return this.page.getByTestId('play-next-song-button');
  }

  public async goToSongList() {
    await this.selectSongButton.click();
  }
}
