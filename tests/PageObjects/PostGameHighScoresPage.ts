import { Browser, BrowserContext, Page } from '@playwright/test';

export class PostGameHighScoresPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get highScoresContainer() {
    return this.page.getByTestId('highscores-container');
  }

  public getPlayerInput(playerName: string) {
    return this.highScoresContainer.getByPlaceholder(playerName);
  }

  public getCoopPlayersInput(playerName_1: string, playerName_2: string) {
    return this.highScoresContainer.getByPlaceholder(`${playerName_1}, ${playerName_2}`);
  }

  public async navigateAndUpdateHighestScorePlayerNameByKeyboard(newName: string) {
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.type(`${newName}`);
    await this.page.keyboard.press('Enter');
    await this.page.keyboard.press('ArrowUp');
    await this.page.waitForTimeout(500); // It takes 300ms to save the score
  }

  public get selectSongButton() {
    return this.page.getByTestId('play-next-song-button');
  }

  public async goToSongList() {
    await this.selectSongButton.click();
  }
}
