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

  public get noSetlistCreatedInfo() {
    return this.page.getByTestId('no-setlist-created');
  }

  public async goToCreateNewSetlist(setlistName: string) {
    await this.dialog.enterMessageWhenDialogAppears(setlistName);
    await this.createNewSetlistButton.click();
  }

  public getSetlistElement(setlistName: string) {
    return this.page.getByTestId(`setlist-${setlistName}`);
  }

  public async expectSetlistSongCountToBe(setlistName: string, songsAmount: number) {
    await expect(this.getSetlistElement(setlistName)).toContainText(`(${songsAmount} songs)`);
  }

  public getEditSetlistButton(setlistName: string) {
    const setlistElement = this.getSetlistElement(setlistName);
    return setlistElement.getByTestId('edit-setlist');
  }

  public async goToEditSetlist(setlistName: string) {
    await this.getEditSetlistButton(setlistName).click();
  }

  public getMakeSetlistNotEditableButton(setlistName: string) {
    const setlistElement = this.getSetlistElement(setlistName);
    return setlistElement.getByTestId('make-setlist-not-editable');
  }

  public getMakeSetlistEditableButton(setlistName: string) {
    const setlistElement = this.getSetlistElement(setlistName);
    return setlistElement.getByTestId('make-setlist-editable');
  }

  public async isSetlistEditModeTurnedOn(setlistName: string) {
    return await this.getMakeSetlistNotEditableButton(setlistName).isVisible();
  }

  public async setSetlistEditMode(setlistName: string, expectedMode: 'editable' | 'not editable') {
    await expect(this.getSetlistElement(setlistName)).toBeVisible();
    const isEditModeON = await this.isSetlistEditModeTurnedOn(setlistName);

    if (expectedMode === 'editable') {
      if (!isEditModeON) {
        await this.getMakeSetlistEditableButton(setlistName).click();
      }
      await expect(this.getMakeSetlistNotEditableButton(setlistName)).toBeVisible();
    }
    if (expectedMode === 'not editable') {
      if (isEditModeON) {
        await this.getMakeSetlistNotEditableButton(setlistName).click();
      }
      await expect(this.getMakeSetlistEditableButton(setlistName)).toBeVisible();
    }
  }

  public getSetlistLockStateIcon(setlistName: string, lockState: 'open' | 'closed') {
    const lockStateNameMap = {
      open: 'LockOpenIcon',
      closed: 'LockOutlinedIcon',
    } as const;
    return this.getSetlistElement(setlistName).locator(`[data-testid="${lockStateNameMap[lockState]}"]`);
  }

  public async expectSetlistEditModeStateToBe(setlistName: string, expectedState: 'on' | 'off') {
    if (expectedState === 'on') {
      await expect(this.getMakeSetlistNotEditableButton(setlistName)).toBeVisible();
      await expect(this.getSetlistLockStateIcon(setlistName, 'open')).toBeVisible();
    }
    if (expectedState === 'off') {
      await expect(this.getMakeSetlistEditableButton(setlistName)).toBeVisible();
      await expect(this.getSetlistLockStateIcon(setlistName, 'closed')).toBeVisible();
    }
  }

  public async ensureSetlistEditorOpened(setlistName: string, editElement: 'search' | 'filters' | 'columns') {
    const editNameToLocatorMap = {
      search: this.songsTable.searchInput,
      filters: this.songsTable.filtersIconButton,
      columns: this.songsTable.showHideColumnButton,
    };

    if (await editNameToLocatorMap[editElement].isHidden()) {
      await this.goToEditSetlist(setlistName);
    }
    await expect(editNameToLocatorMap[editElement]).toBeVisible();
  }

  public async searchSetlistSong(setlistName: string, songID: string) {
    await this.ensureSetlistEditorOpened(setlistName, 'search');
    await this.songsTable.searchSongs(songID);
  }

  public getRemoveSetlistButton(setlistName: string) {
    const setlistElement = this.getSetlistElement(setlistName);
    return setlistElement.getByTestId('remove-setlist');
  }

  public async clickToRemoveSetlist(setlistName: string) {
    await this.getRemoveSetlistButton(setlistName).click();
  }

  public async removeSetlist(setlistName: string) {
    await this.dialog.acceptWhenDialogAppears();
    await this.clickToRemoveSetlist(setlistName);
  }

  public getCopySetlistLinkButton(setlistName: string) {
    const setlistElement = this.getSetlistElement(setlistName);
    return setlistElement.getByTestId('copy-setlist-link');
  }

  public async clickToCopyLinkToSetlist(setlistName: string) {
    await this.getCopySetlistLinkButton(setlistName).click();
  }

  public async getSetlistURL(setlistName: string) {
    await this.ensureSetlistEditorOpened(setlistName, 'search');
    await this.songsTable.searchInput.clear();
    await this.songsTable.searchInput.press('Meta+V');
    return (await this.songsTable.searchInput.getAttribute('value'))!;
  }

  public async copyAndOpenLinkToSetlist(setlistName: string) {
    await this.clickToCopyLinkToSetlist(setlistName);
    const setlistURL = await this.getSetlistURL(setlistName);
    await this.page.goto(setlistURL);
  }

  public async expectDefaultSetlistButtonsToBeVisible(setlistName: string) {
    await expect(this.getEditSetlistButton(setlistName)).toBeVisible();
    await expect(this.getMakeSetlistNotEditableButton(setlistName)).toBeVisible();
    await expect(this.getRemoveSetlistButton(setlistName)).toBeVisible();
    await expect(this.getCopySetlistLinkButton(setlistName)).toBeVisible();
  }

  public getSongElement(songID: string) {
    const songSelector = this.songsTable.getSongIDSelector(songID);
    this.songsTable.searchSongs(songID);
    return this.page.locator(`${songSelector}[data-test="toggle-selection"]`);
  }

  private getSongCheckboxComponent(songID: string) {
    const songCheckbox = this.getSongElement(songID);
    return new Checkboxes(this.page, this.context, this.browser, songCheckbox);
  }

  public async isSongSelected(songID: string) {
    return await this.getSongCheckboxComponent(songID).isCheckboxSelected();
  }

  private async ensureSongStateToBe(setlistName: string, songID: string, state: checkboxesStateType) {
    await this.searchSetlistSong(setlistName, songID);
    await this.getSongCheckboxComponent(songID).ensureCheckboxStateToBe(state);
  }

  public async addSongToSetlist(setlistName: string, songID: string) {
    await this.ensureSongStateToBe(setlistName, songID, 'selected');
  }

  public async removeSongFromSetlist(setlistName: string, songID: string) {
    await this.ensureSongStateToBe(setlistName, songID, 'unselected');
  }

  private async expectSongStateToBe(setlistName: string, songID: string, expectedState: checkboxesStateType) {
    await this.searchSetlistSong(setlistName, songID);
    await this.getSongCheckboxComponent(songID).expectCheckboxStateToBe(expectedState);
  }

  public async expectSongToBeSelected(setlistName: string, songID: string) {
    await this.expectSongStateToBe(setlistName, songID, 'selected');
  }

  public async expectSongToBeUnselected(setlistName: string, songID: string) {
    await this.expectSongStateToBe(setlistName, songID, 'unselected');
  }
}
