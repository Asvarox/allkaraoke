import { Browser, BrowserContext, Page, expect } from '@playwright/test';
import { Checkboxes, checkboxesStateType } from '../components/checkboxes';
import { Dialog } from '../components/dialog';
import { SongsTable } from '../components/songs-table';

export class ManageSetlistsPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  dialog = new Dialog(this.page, this.context, this.browser);
  songsTable = new SongsTable(this.page, this.context, this.browser);

  public get setlistUserInfo() {
    return this.page.locator('.MuiGrid-container');
  }

  public get mainMenuButton() {
    return this.page.getByTestId('main-menu-link');
  }

  public async goBackToMainMenu() {
    await this.mainMenuButton.click();
  }

  public get createNewSetlistButton() {
    return this.page.getByTestId('create-new-setlist');
  }

  public async goToCreateNewSetlist(setlistName: string) {
    await this.dialog.enterMessageWhenDialogAppears(setlistName);
    await this.createNewSetlistButton.click();
  }

  public getCreatedSetlistElement(setlistName: string) {
    return this.page.getByTestId(`setlist-${setlistName}`);
  }

  public async expectSetlistSongCountToBe(setlistName: string, songsAmount: number) {
    await expect(this.getCreatedSetlistElement(setlistName)).toContainText(`(${songsAmount} songs)`);
  }

  public getEditSetlistButton(setlistName: string) {
    const setlistElement = this.getCreatedSetlistElement(setlistName);
    return setlistElement.getByTestId('edit-setlist');
  }

  public async goToEditSetlist(setlistName: string) {
    await this.getEditSetlistButton(setlistName).click();
  }

  makeNotEditableSelector = 'make-setlist-not-editable';

  public getNotEditableSetlistButton(setlistName: string) {
    const setlistElement = this.getCreatedSetlistElement(setlistName);
    return setlistElement.getByTestId(this.makeNotEditableSelector);
  }

  public getEditableSetlistButton(setlistName: string) {
    const setlistElement = this.getCreatedSetlistElement(setlistName);
    return setlistElement.getByTestId('make-setlist-editable');
  }

  public async isSetlistEditModeTurnedOn(setlistName: string) {
    const setlistElement = this.getCreatedSetlistElement(setlistName);

    const editModeAttribute = await setlistElement
      .getByTestId(/^make-setlist-(not-)?editable$/)
      .getAttribute('data-test');
    return editModeAttribute === this.makeNotEditableSelector;
  }

  public async clickToSetSetlistEditMode(setlistName: string, expectedMode: 'editable' | 'not editable') {
    const isEditModeON = this.isSetlistEditModeTurnedOn(setlistName);

    if (expectedMode === 'editable') {
      if (!isEditModeON) {
        await this.getEditableSetlistButton(setlistName).click();
      }
      await expect(this.getNotEditableSetlistButton(setlistName)).toBeVisible();
    }
    if (expectedMode === 'not editable') {
      if (await isEditModeON) {
        await this.getNotEditableSetlistButton(setlistName).click();
      }
      await expect(this.getEditableSetlistButton(setlistName)).toBeVisible();
    }
  }

  public getSetlistLockStateIcon(setlistName: string, lockState: 'open' | 'closed') {
    const lockStateNameMap = {
      open: 'Open',
      closed: 'Outlined',
    } as const;

    return this.getCreatedSetlistElement(setlistName).locator(`[data-testid="Lock${lockStateNameMap[lockState]}Icon"]`);
  }

  public async expectSetlistEditModeStateToBe(setlistName: string, expectedState: 'on' | 'off') {
    if (expectedState === 'on') {
      await expect(this.getNotEditableSetlistButton(setlistName)).toBeVisible();
      await expect(this.getSetlistLockStateIcon(setlistName, 'open')).toBeVisible();
    }
    if (expectedState === 'off') {
      await expect(this.getEditableSetlistButton(setlistName)).toBeVisible();
      await expect(this.getSetlistLockStateIcon(setlistName, 'closed')).toBeVisible();
    }
  }

  public getRemoveSetlistButton(setlistName: string) {
    const setlistElement = this.getCreatedSetlistElement(setlistName);
    return setlistElement.getByTestId('remove-setlist');
  }

  public async clickToRemoveSetlist(setlistName: string) {
    await this.getRemoveSetlistButton(setlistName).click();
  }

  public getCopySetlistLinkButton(setlistName: string) {
    const setlistElement = this.getCreatedSetlistElement(setlistName);
    return setlistElement.getByTestId('copy-setlist-link');
  }

  public async clickToCopyLinkToSetlist(setlistName: string) {
    await this.getCopySetlistLinkButton(setlistName).click();
  }

  public async expectDefaultSetlistButtonsToBeVisible(setlistName: string) {
    await expect(this.getEditSetlistButton(setlistName)).toBeVisible();
    await expect(this.getNotEditableSetlistButton(setlistName)).toBeVisible();
    await expect(this.getRemoveSetlistButton(setlistName)).toBeVisible();
    await expect(this.getCopySetlistLinkButton(setlistName)).toBeVisible();
  }

  public getSongToggle(songID: string) {
    return this.page.locator(`[data-song="${songID}"][data-test="toggle-selection"]`);
  }

  private getSongCheckboxComponent(songID: string) {
    const songCheckbox = this.getSongToggle(songID).locator('svg');
    return new Checkboxes(this.page, this.context, this.browser, songCheckbox);
  }

  public async isSongSelected(songID: string) {
    return await this.getSongCheckboxComponent(songID).isCheckboxSelected();
  }

  public async addSongToSetlist(songID: string) {
    await this.songsTable.searchSongs(songID);
    if (!(await this.isSongSelected(songID))) {
      await this.getSongToggle(songID).click();
    }
  }

  public async removeSongFromSetlist(songID: string) {
    await this.songsTable.searchSongs(songID);
    if (await this.isSongSelected(songID)) {
      await this.getSongToggle(songID).click();
    }
  }

  public async ensureSongStateToBe(songID: string, state: checkboxesStateType) {
    await this.songsTable.searchSongs(songID);
    await this.getSongCheckboxComponent(songID).ensureCheckboxStateToBe(state);
  }

  public async expectSongStateToBe(songID: string, expectedState: checkboxesStateType) {
    await this.songsTable.searchSongs(songID);
    await this.getSongCheckboxComponent(songID).expectCheckboxStateToBe(expectedState);
  }
}
