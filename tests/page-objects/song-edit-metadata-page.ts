import { Browser, BrowserContext, Page } from '@playwright/test';

export class SongEditMetadataPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get pageContainer() {
    return this.page.getByTestId('song-metadata');
  }

  public get previousButton() {
    return this.page.getByTestId('previous-button');
  }

  public async goBackToSyncLyricsStep() {
    await this.previousButton.click();
  }

  public get saveButton() {
    return this.page.getByTestId('save-button');
  }

  public async saveAndGoToEditSongsPage() {
    await this.saveButton.click();
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

  public get songLanguageElement() {
    return this.page.getByTestId('song-language');
  }

  public get artistOriginElement() {
    return this.page.getByTestId('artist-origin');
  }

  public get artistOriginInput() {
    return this.artistOriginElement.locator('.MuiSelect-nativeInput');
  }

  public async enterArtistOrigin(countryIsoCode: string) {
    await this.artistOriginElement.click();
    await this.page.locator(`[data-value="${countryIsoCode}"]`).click();
  }

  public get songLanguageInput() {
    return this.songLanguageElement.locator('input');
  }

  public async enterSongLanguage(language: string) {
    await this.songLanguageInput.fill(language);
  }

  public get releaseYearInput() {
    return this.page.locator('[data-test="release-year"] input');
  }

  public async enterReleaseYear(year: string) {
    await this.releaseYearInput.fill(year);
  }

  public get bpmSongInput() {
    return this.page.locator('[data-test="song-bpm"] input');
  }

  public async enterSongBPM(songBPM: string) {
    await this.bpmSongInput.fill(songBPM);
  }

  public get songPreviewElement() {
    return this.page.getByTestId('song-preview');
  }

  public get startOfSongPreview() {
    return this.songPreviewElement.locator('input[data-index="0"]');
  }

  public async setStartOfSongPreview(timeSec: string) {
    await this.startOfSongPreview.fill(timeSec);
  }

  public get endOfSongPreview() {
    return this.songPreviewElement.locator('input[data-index="1"]');
  }

  public async setEndOfSongPreview(timeSec: string) {
    await this.endOfSongPreview.fill(timeSec);
  }

  public get currentSongVolumeLevel() {
    return this.page.locator('[data-test="volume"] input');
  }

  public async setTheVolumeOfTheSong(finalValue: string) {
    await this.currentSongVolumeLevel.fill(finalValue);
  }
}
