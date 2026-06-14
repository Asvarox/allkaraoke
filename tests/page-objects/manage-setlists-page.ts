import { Browser, BrowserContext, Page, expect } from '@playwright/test';
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
    return this.page.getByTestId('manage-setlists-page');
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

  public getMakeSetlistNotEditableButton(setlistName: string) {
    const setlistElement = this.getCreatedSetlistElement(setlistName);
    return setlistElement.getByTestId(this.makeNotEditableSelector);
  }

  public getMakeSetlistEditableButton(setlistName: string) {
    const setlistElement = this.getCreatedSetlistElement(setlistName);
    return setlistElement.getByTestId('make-setlist-editable');
  }

  public async isSetlistEditModeTurnedOn(setlistName: string) {
    return await this.getMakeSetlistNotEditableButton(setlistName).isVisible();
  }

  public async clickToSetSetlistEditMode(setlistName: string, expectedMode: 'editable' | 'not editable') {
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

  public async expectSetlistEditModeStateToBe(setlistName: string, expectedState: 'on' | 'off') {
    if (expectedState === 'on') {
      await expect(this.getMakeSetlistNotEditableButton(setlistName)).toBeVisible();
    }
    if (expectedState === 'off') {
      await expect(this.getMakeSetlistEditableButton(setlistName)).toBeVisible();
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
    await expect(this.getMakeSetlistNotEditableButton(setlistName)).toBeVisible();
    await expect(this.getRemoveSetlistButton(setlistName)).toBeVisible();
    await expect(this.getCopySetlistLinkButton(setlistName)).toBeVisible();
  }

  public getSongCheckbox(songID: string) {
    return this.page.locator(`[data-song="${songID}"][data-test="toggle-selection"]`);
  }

  public getSongCheckboxControl(songID: string) {
    return this.getSongCheckbox(songID).getByRole('checkbox');
  }

  public async clickToSelectSongCheckbox(songID: string) {
    await this.getSongCheckbox(songID).click();
  }

  public async addSongToSetlist(songID: string) {
    await this.songsTable.searchSongs(songID);
    if (!(await this.isSongCheckboxSelected(songID))) {
      await this.clickToSelectSongCheckbox(songID);
    }
  }

  public async removeSongFromSetlist(songID: string) {
    await this.songsTable.searchSongs(songID);
    if (await this.isSongCheckboxSelected(songID)) {
      await this.getSongCheckbox(songID).click();
    }
  }

  private async expectSongCheckboxStateToBe(songID: string, expectedState: 'selected' | 'unselected') {
    await this.songsTable.searchSongs(songID);
    const checkbox = this.getSongCheckboxControl(songID);

    if (expectedState === 'selected') {
      await expect(checkbox).toBeChecked();
    }

    if (expectedState === 'unselected') {
      await expect(checkbox).not.toBeChecked();
    }
  }

  public async expectSongToBeSelected(songID: string) {
    await this.expectSongCheckboxStateToBe(songID, 'selected');
  }

  public async expectSongToBeUnselected(songID: string) {
    await this.expectSongCheckboxStateToBe(songID, 'unselected');
  }

  public async isSongCheckboxSelected(songID: string) {
    return await this.getSongCheckboxControl(songID).isChecked();
  }
}
