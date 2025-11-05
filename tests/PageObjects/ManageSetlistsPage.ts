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

  public getSongCheckbox(songID: string) {
    return this.page.locator(`[data-song="${songID}"][data-test="toggle-selection"]`);
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

  selectedCheckboxIDSelector = 'CheckBoxIcon';
  unselectedCheckboxIDSelector = 'CheckBoxOutlineBlankIcon';

  public async expectSongCheckboxStateToBe(songID: string, expectedState: 'selected' | 'unselected') {
    const stateToIdMap = {
      selected: this.selectedCheckboxIDSelector,
      unselected: this.unselectedCheckboxIDSelector,
    } as const;

    await this.songsTable.searchSongs(songID);
    await expect(this.getSongCheckbox(songID).locator('svg')).toHaveAttribute(
      'data-testid',
      stateToIdMap[expectedState],
    );
  }

  public async isSongCheckboxSelected(songID: string) {
    const songCheckboxAttribute = await this.getSongCheckbox(songID).locator('svg').getAttribute('data-testid');
    return songCheckboxAttribute === this.selectedCheckboxIDSelector;
  }
}
