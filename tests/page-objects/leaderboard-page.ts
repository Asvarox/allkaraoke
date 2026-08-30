import { Browser, BrowserContext, expect, Page } from '@playwright/test';

export class LeaderboardPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  // --- Post-game prompt ---

  public get prompt() {
    return this.page.getByTestId('leaderboard-prompt');
  }

  // `Input` forwards unknown props to the inner `<input>`, so the test id lands on the field itself
  public get nameInput() {
    return this.prompt.getByTestId('leaderboard-name');
  }

  public get countryInput() {
    return this.prompt.getByTestId('leaderboard-country');
  }

  public get submitButton() {
    return this.prompt.getByTestId('leaderboard-submit');
  }

  public get declineButton() {
    return this.prompt.getByTestId('leaderboard-decline');
  }

  // --- High-scores step panel ---

  /** Shown once the player shares by default: the identity they share under, and a way to stop. */
  public get sharePanel() {
    return this.page.getByTestId('leaderboard-share-panel');
  }

  /** Shown once the player has declined: the way back into the prompt. */
  public get optInPanel() {
    return this.page.getByTestId('leaderboard-opt-in-panel');
  }

  public get stopSharingButton() {
    return this.page.getByTestId('leaderboard-stop-sharing');
  }

  public get openPromptButton() {
    return this.page.getByTestId('leaderboard-open-prompt');
  }

  public get panelNameInput() {
    return this.sharePanel.getByTestId('leaderboard-name');
  }

  public async fillIdentity(name: string, country: string) {
    await this.nameInput.fill(name);

    // Opening the picker swaps the field from the committed label to an empty search box; typing
    // before that lands would be wiped by the re-render, so wait for it to actually open
    await this.countryInput.click();
    await expect(this.countryInput).toHaveAttribute('aria-expanded', 'true');
    await this.countryInput.fill(country);
    await expect(this.prompt.locator('[role="listbox"]')).toContainText(country);
    await this.countryInput.press('Enter');

    await expect(this.countryInput).toHaveValue(country);
  }

  public async submit() {
    await this.submitButton.click();
    await expect(this.prompt).not.toBeVisible();
  }

  // --- High-scores step: the board for the song just sung ---

  /** One song at one difficulty, beside the local high scores. */
  public get songPanel() {
    return this.page.getByTestId('song-leaderboard-panel');
  }

  public get songPanelRows() {
    return this.songPanel.getByTestId('song-leaderboard-row');
  }

  /** The run just sung, slotted into the board where it would land and ringed like a focused control. */
  public get songPanelOwnRow() {
    return this.songPanel.getByTestId('song-leaderboard-own-row');
  }

  // --- Main-menu panel ---

  /**
   * The board is rendered twice — beside the menu on desktop, inside it on mobile — and only one of
   * the two is ever on screen, so match the visible one rather than a DOM position.
   */
  public get panel() {
    return this.page.getByTestId('leaderboard-panel').and(this.page.locator(':visible'));
  }

  public get rows() {
    return this.panel.getByTestId('leaderboard-row');
  }

  /**
   * The board is global and ordered by score, so a freshly submitted row is not necessarily first —
   * look it up by name rather than by position.
   */
  public rowFor(name: string) {
    return this.rows.filter({ hasText: name });
  }

  public async expectRowFor(name: string, ...texts: string[]) {
    const row = this.rowFor(name).first();

    await expect(row).toBeVisible();
    for (const text of texts) {
      await expect(row).toContainText(text);
    }
  }
}
