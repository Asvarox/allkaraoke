import { Browser, BrowserContext, Page } from '@playwright/test';

export class PostGameHighScoresPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

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

  public async goToSelectNewSong() {
    await this.page.getByTestId('play-next-song-button').click();
  }
}
