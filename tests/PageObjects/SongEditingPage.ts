import { Browser, BrowserContext, Page } from '@playwright/test';

export class SongEditingPagePO {
  constructor(private page: Page, private context: BrowserContext, private browser: Browser) {}

  public get basicSongInfoPreview() {
    return this.page.getByTestId('basic-data');
  }

  public get authorAndVideoInfoPreview() {
    return this.page.getByTestId('author-and-vid');
  }

  public get urlSourceInput() {
    return this.page.locator('[data-test="source-url"] input');
  }

  public async enterSourceURL(urlSource: string) {
    await this.urlSourceInput.fill(urlSource);
  }

  public get authorNameInput() {
    return this.page.locator('[data-test="author-name"] input');
  }

  public async enterAuthorName(name: string) {
    await this.authorNameInput.fill(name);
  }

  public get authorUrlInput() {
    return this.page.locator('[data-test="author-url"] input');
  }

  public async enterAuthorURL(authorUrl: string) {
    await this.authorUrlInput.fill(authorUrl);
  }

  public get videoUrlInput() {
    return this.page.locator('[data-test="video-url"] input');
  }

  public async enterVideoURL(videoUrl: string) {
    await this.videoUrlInput.fill(videoUrl);
  }

  public get videoLookupButton() {
    return this.page.locator('[data-test="video-url"] button');
  }

  public get songLyrics() {
    return this.page.getByTestId('sync-lyrics');
  }

  public get songLanguageInput() {
    return this.page.locator('[data-test="song-language"] input');
  }

  public async enterSongLanguage(language: string) {
    await this.songLanguageInput.fill(language);
  }

  public get selectedLanguagePreview() {
    return this.page.getByTestId('song-language');
  }

  public get releaseYearInput() {
    return this.page.locator('[data-test="release-year"] input');
  }

  public async enterReleaseYear(year: string) {
    // nie number?
    await this.releaseYearInput.fill(year);
  }

  public get bpmSongInput() {
    return this.page.locator('[data-test="song-bpm"] input');
  }

  public async enterSongBPM(songBPM: string) {
    await this.bpmSongInput.fill(songBPM);
  }

  public get txtInput() {
    return this.page.getByTestId('input-txt');
  }

  public async enterSongTXT(txtFile: string) {
    await this.txtInput.fill(txtFile);
  }

  public get duplicateSongAlert() {
    return this.page.getByTestId('possible-duplicate');
  }

  public get saveButton() {
    return this.page.getByTestId('save-button');
  }

  public async saveChanges() {
    await this.saveButton.click();
  }

  public get previousButton() {
    return this.page.getByTestId('previous-button');
  }

  public async previousStep() {
    await this.previousButton.click();
  }

  public get nextButton() {
    return this.page.getByTestId('next-button');
  }

  public async nextStep() {
    await this.nextButton.click();
  }

  public async togglePlaybackSpeedControls(control: number) {
    await this.page.locator(`[data-test="speed-${control}"]`).click();
  }

  public get videoGapShiftInput() {
    return this.page.locator('[data-test="shift-video-gap"] input');
  }

  public async enterVideoGapShift(value: string) {
    await this.videoGapShiftInput.fill(value);
  }

  public async toggleVideoGapShiftControls(control: string) {
    await this.page.locator(`[data-test="shift-video-gap${control}s"]`).click();
  }

  public get gapShiftInput() {
    return this.page.locator('[data-test="shift-gap"] input');
  }

  public async enterGapShift(value: string) {
    await this.gapShiftInput.fill(value);
  }

  public async toggleGapShiftControls(control: string) {
    await this.page.locator(`[data-test="shift-gap${control}s"]`).click();
  }

  public get desiredEndTimeInput() {
    return this.page.locator('[data-test="desired-end"] input');
  }

  public async enterDesiredEndTime(value: string) {
    await this.desiredEndTimeInput.fill(value);
  }

  public get desiredLyricsBpmElement() {
    return this.page.getByTestId('desired-bpm');
  }

  public get changeLyricsBpmInput() {
    return this.page.locator('[data-test="change-bpm"] input');
  }

  public async enterChangedLyricsBPM(value: string) {
    await this.changeLyricsBpmInput.fill(value);
  }

  public trackButton(number: number) {
    return this.page.getByTestId(`track-${number}`);
  }

  public async goToTrackNumber(number: number) {
    await this.trackButton(number).click();
  }

  public async enterTrackName(name: string) {
    await this.page.locator('[data-test=track-name] input').fill(name);
  }

  public textLineElement(lineNumber: number) {
    return this.page.getByTestId(`section-${lineNumber}`);
  }

  public async clickOnTextLine(lineNumber: number) {
    await this.textLineElement(lineNumber).click();
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

  public get songArtistInput() {
    return this.page.locator('[data-test="song-artist"] input');
  }

  public async enterSongArtist(name: string) {
    await this.songArtistInput.fill(name);
  }

  public get songTitleInput() {
    return this.page.locator('[data-test="song-title"] input');
  }

  public async enterSongTitle(name: string) {
    await this.songTitleInput.fill(name);
  }

  public get songGenreInput() {
    return this.page.locator('[data-test="song-genre"] input');
  }

  public async enterSongGenre(name: string) {
    await this.songGenreInput.fill(name);
  }

  public get songTimelineElement() {
    return this.page.getByTestId('song-preview');
  }

  public get startOfSongPreview() {
    return this.songTimelineElement.locator('input[data-index="0"]');
  }

  public async shiftStartOfSongPreview(timeSec: string) {
    await this.startOfSongPreview.fill(timeSec);
  }

  public get endOfSongPreview() {
    return this.songTimelineElement.locator('input[data-index="1"]');
  }

  public async shiftEndOfSongPreview(timeSec: string) {
    await this.endOfSongPreview.fill(timeSec);
  }

  public get currentSongVolumeLevel() {
    return this.page.locator('[data-test="volume"] input');
  }

  public async changeTheVolumeOfTheSong(finalValue: string) {
    await this.currentSongVolumeLevel.fill(finalValue);
  }

  public get lyricsContainer() {
    return this.page.locator('.ul.MuiList-padding');
  }
}
