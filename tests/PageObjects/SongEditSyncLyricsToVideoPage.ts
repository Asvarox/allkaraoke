import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class SongEditSyncLyricsToVideoPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get pageContainer() {
    return this.page.getByTestId('sync-lyrics');
  }

  public get previousButton() {
    return this.page.getByTestId('previous-button');
  }

  public async goBackToAuthorAndVideoStep() {
    await this.previousButton.click();
  }

  public get nextButton() {
    return this.page.getByTestId('next-button');
  }

  public async goToMetadataStep() {
    await this.nextButton.click();
  }

  public async timeSeekControls(control: string) {
    await this.page.locator(`[data-test="seek${control}s"]`).click();
  }

  public async setPlaybackSpeedControls(control: number) {
    await this.page.locator(`[data-test="speed-${control}"]`).click();
  }

  public async expectCurrentPlaybackSpeedToBe(control: number) {
    await expect(this.page.getByTestId('current-speed')).toHaveText(`${control * 100}%`);
  }

  public get videoGapShiftInput() {
    return this.page.locator('[data-test="shift-video-gap"] input');
  }

  public async enterVideoGapShift(value: string) {
    await this.videoGapShiftInput.fill(value);
  }

  public async changeVideoGapShiftBy(value: string) {
    await this.page.locator(`[data-test="shift-video-gap${value}s"]`).click();
  }

  public get lyricsGapShiftInput() {
    return this.page.locator('[data-test="shift-gap"] input');
  }

  public async enterLyricsGapShift(value: string) {
    await this.lyricsGapShiftInput.fill(value);
  }

  public async changeLyricsGapShiftBy(value: string) {
    await this.page.locator(`[data-test="shift-gap${value}s"]`).click();
  }

  public get desiredSongEndTimeInput() {
    return this.page.locator('[data-test="desired-end"] input');
  }

  public async enterDesiredSongEndTime(value: string) {
    await this.desiredSongEndTimeInput.fill(value);
  }

  public get estProperTempoBpmElement() {
    return this.page.getByTestId('desired-bpm');
  }

  public get changeLyricsBpmInput() {
    return this.page.locator('[data-test="change-bpm"] input');
  }

  public async enterLyricsBPM(value: string) {
    await this.changeLyricsBpmInput.fill(value);
  }

  public getTrackButton(number: number) {
    return this.page.getByTestId(`track-${number}`);
  }

  public async goToSongTrack(number: number) {
    await this.getTrackButton(number).click();
  }

  public async enterSongTrackName(name: string) {
    await this.page.locator('[data-test=track-name] input').fill(name);
  }

  public getTextLineElement(lineNumber: number) {
    return this.page.getByTestId(`section-${lineNumber}`);
  }

  public async clickOnTextLine(lineNumber: number) {
    await this.getTextLineElement(lineNumber).click();
  }

  public get useGapInfo() {
    return this.page.getByTestId('use-gap-info');
  }

  public get changeStartBeatInput() {
    return this.page.locator('[data-test="change-start-beat"] input');
  }

  public async enterStartBeat(value: string) {
    await this.changeStartBeatInput.fill(value);
  }

  public get undoChangeButton() {
    return this.page.getByTestId('undo-change');
  }

  public async undoLastChange() {
    await this.undoChangeButton.click();
  }

  public get deleteSectionButton() {
    return this.page.getByTestId('delete-section');
  }

  public async deleteTextLine() {
    await this.deleteSectionButton.click();
  }
}
