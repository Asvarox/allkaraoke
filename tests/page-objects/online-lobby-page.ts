import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class OnlineLobbyPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get lobbyElement() {
    return this.page.getByTestId('online-lobby');
  }

  public async expectToBeVisible(options?: { timeout?: number }) {
    await expect(this.lobbyElement).toBeVisible(options);
  }

  public async expectNotToBeVisible(options?: { timeout?: number }) {
    await expect(this.lobbyElement).not.toBeVisible(options);
  }

  /** The room the lobby is showing — the code is kept in the URL so the page is shareable/refreshable. */
  public async getRoomCode() {
    const roomCode = new URL(this.page.url()).searchParams.get('room');
    expect(roomCode).toBeTruthy();

    return roomCode!;
  }

  public participantElement(playerNumber: number) {
    return this.page.getByTestId(`online-participant-${playerNumber}`);
  }

  public participantHostTagElement(playerNumber: number) {
    return this.participantElement(playerNumber).getByTestId('participant-host');
  }

  /** The singer rows as rendered next to the song browser, where they also carry the song votes. */
  public songPlayerElement(playerNumber: number) {
    return this.page.getByTestId(`online-song-player-${playerNumber}`);
  }

  public get browsedSongTitleElement() {
    return this.page.getByTestId('online-host-browsing-title');
  }

  public get browsedSongArtistElement() {
    return this.page.getByTestId('online-host-browsing-artist');
  }

  public get browsedSongDetailsElement() {
    return this.page.getByTestId('online-host-browsing-details');
  }

  public get selectedSongElement() {
    return this.page.getByTestId('online-selected-song');
  }

  public get chooseSongButton() {
    return this.page.getByTestId('choose-song-button');
  }

  public async goToSongSelection() {
    await this.chooseSongButton.click();
  }

  public get voteUpButton() {
    return this.page.getByTestId('online-vote-up');
  }

  public async voteUp() {
    await this.voteUpButton.click();
  }

  public get startSongButton() {
    return this.page.getByTestId('online-start-song-button');
  }

  public async startSong() {
    await this.startSongButton.click();
  }

  public kickButton(playerNumber: number) {
    return this.page.getByTestId(`online-kick-${playerNumber}`);
  }

  public get kickConfirmModalElement() {
    return this.page.getByTestId('online-kick-confirm-modal');
  }

  public async kickParticipant(playerNumber: number) {
    await this.kickButton(playerNumber).click();
    await this.kickConfirmModalElement.getByTestId('confirm-kick-participant').click();
  }

  public get customizeButton() {
    return this.page.getByTestId('customize-button');
  }

  public get customizeModalElement() {
    return this.page.getByTestId('online-customize-modal');
  }

  public colorButton(colorNumber: number) {
    return this.page.getByTestId(`player-color-${colorNumber}`);
  }

  public async openCustomizeModal() {
    await this.customizeButton.click();
  }

  public async pickColor(colorNumber: number) {
    await this.colorButton(colorNumber).click();
  }

  public get leaveRoomButton() {
    return this.page.getByTestId('leave-room-button');
  }

  public get leaveConfirmModalElement() {
    return this.page.getByTestId('online-leave-confirm-modal');
  }

  public async leaveRoomAndCancel() {
    await this.leaveRoomButton.click();
    await this.leaveConfirmModalElement.getByTestId('stay-in-room').click();
  }

  public async leaveRoomAndConfirm() {
    await this.leaveRoomButton.click();
    await this.leaveConfirmModalElement.getByTestId('confirm-leave-room').click();
  }
}
