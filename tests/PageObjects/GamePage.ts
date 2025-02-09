import { Browser, BrowserContext, Page, expect } from '@playwright/test';
import navigateWithKeyboard from '../steps/navigateWithKeyboard';

export class GamePagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get skipIntroElement() {
    return this.page.getByTestId('skip-intro-info');
  }

  public async skipIntroIfPossible() {
    try {
      const skipIntroEl = await this.page.waitForSelector('[data-test="skip-intro-info"]', { timeout: 5_000 });

      if (skipIntroEl) {
        await this.page.keyboard.press('Enter');
      }
    } catch (error) {
      console.log('Skip-intro-info is not visible', error);
    }
  }

  public async goToPauseMenu() {
    await this.page.locator('body').click({ force: true, position: { x: 350, y: 350 } });
  }

  public async goToPauseMenuByKeyboard() {
    await this.page.keyboard.press('Backspace');
  }

  public get restartButton() {
    return this.page.getByTestId('button-restart-song');
  }

  public async restartSong() {
    await this.goToPauseMenuByKeyboard();
    await this.restartButton.click();
  }

  public get resumeSongButton() {
    return this.page.getByTestId('button-resume-song');
  }

  public async resumeSong() {
    await this.goToPauseMenuByKeyboard();
    await this.resumeSongButton.click();
  }

  public async exitSong() {
    await this.goToPauseMenuByKeyboard();
    await this.page.getByTestId('button-exit-song').click();
  }

  public async navigateAndApproveWithKeyboard(
    buttonName:
      | 'button-resume-song'
      | 'button-restart-song'
      | 'button-exit-song'
      | 'input-settings'
      | 'input-lag'
      | 'edit-song',
    remoteMic?: Page,
  ) {
    await navigateWithKeyboard(this.page, buttonName, remoteMic);
    await this.page.keyboard.press('Enter');
  }

  public async microphonesSettings() {
    await this.page.getByTestId('input-settings').click();
  }

  public getPlayerScoreElement(playerNumber: number) {
    return this.page.getByTestId(`player-${playerNumber}-score`);
  }

  public async getCurrentPlayerScore(playerNumber: number) {
    return this.getPlayerScoreElement(playerNumber).getAttribute('data-score');
  }

  public async expectPlayerScoreValueToBe(playerNumber: number, expectedScore: string) {
    await expect(this.getPlayerScoreElement(playerNumber)).toHaveAttribute('data-score', expectedScore);
  }

  public get playersCoopScoreElement() {
    return this.page.getByTestId('players-score');
  }

  public get currentPlayersCoopScore() {
    return this.playersCoopScoreElement.getAttribute('data-score');
  }

  public async waitForPlayersScoreToBeGreaterThan(expected: number) {
    await expect(async () => {
      const p1score = await this.currentPlayersCoopScore;

      expect(parseInt(p1score!, 10)).toBeGreaterThan(expected);
    }).toPass({ timeout: 15_000 });
  }

  public async expectPlayersCoopScoreValueToBe(expected: number) {
    await expect(this.playersCoopScoreElement).toHaveAttribute('data-score', `${expected}`, { timeout: 15_000 });
  }

  public getSongLyricsForPlayerElement(playerNumber: number) {
    return this.page.getByTestId(`lyrics-container-player-${playerNumber}`);
  }

  public get songArtistAndTitleContainer() {
    return this.page.getByTestId('background-container');
  }

  public async expectArtistAndSongTitleToBeShown(artist: string, title: string) {
    await expect(this.songArtistAndTitleContainer).toBeVisible();
    await expect(this.page.getByTestId('song-artist')).toHaveText(artist);
    await expect(this.page.getByTestId('song-title')).toHaveText(title);
  }

  public get changeIndicatorIcon() {
    return this.page.getByTestId('SwapHorizIcon');
  }

  public get passTheMicProgressElement() {
    return this.page.getByTestId('pass-the-mic-progress');
  }
}
