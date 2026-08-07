import { Browser, BrowserContext, expect, Page } from '@playwright/test';

/**
 * The row of song group buttons. Rendered both by the song selection screen and — mirrored — by a
 * connected remote mic, with the same test ids and the same two highlight states, so one component
 * drives assertions against either page.
 */
export class SongGroupsNavigation {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public get groups() {
    return this.page.locator('[data-test^="group-navigation-"]');
  }

  public group(groupName: string) {
    return this.page.getByTestId(`group-navigation-${groupName}`);
  }

  public async goToGroup(groupName: string) {
    await this.group(groupName).click();
  }

  /** The groups the row offers, by their labels, in row order. */
  public async expectGroupsToBe(groupLabels: string[]) {
    await expect(this.groups).toHaveText(groupLabels);
  }

  public async expectGroupToBeOffered(groupName: string) {
    await expect(this.group(groupName)).toBeVisible();
  }

  /** The group's header is currently scrolled into view in the song list. */
  public async expectGroupToBeVisibleInTheSongList(groupName: string) {
    await expect(this.group(groupName)).toHaveAttribute('data-active', 'true');
  }

  public async expectGroupNotToBeVisibleInTheSongList(groupName: string) {
    await expect(this.group(groupName)).toHaveAttribute('data-active', 'false');
  }

  /**
   * The currently selected song lives in this group. Only marked while the group itself is scrolled
   * out of view — once it's visible the regular highlight takes over, so assert this on a group the
   * list has scrolled away from.
   */
  public async expectGroupToHoldTheSelectedSong(groupName: string) {
    await expect(this.group(groupName)).toHaveAttribute('data-subtle-focus', 'true');
  }

  public async expectGroupNotToHoldTheSelectedSong(groupName: string) {
    await expect(this.group(groupName)).not.toHaveAttribute('data-subtle-focus', 'true');
  }
}
