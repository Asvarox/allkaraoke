import { Browser, BrowserContext, Page } from '@playwright/test';

export class LandingPagePO {
  constructor(
    private page: Page,
    private context: BrowserContext,
    private browser: Browser,
  ) {}

  public async enterTheGame() {
    // On landing page there are two of these buttons - for mobile and desktop
    // Firefox sometimes mixes up desktop and mobile (due to @media hover) - not sure why.
    // This hack makes sure it clicks the right one.
    await this.page.getByTestId('enter-the-game').and(this.page.locator(':visible')).click();
  }
  public async joinExistingGame() {
    // On landing page there are two of these buttons - for mobile and desktop
    // Firefox sometimes mixes up desktop and mobile (due to @media hover) - not sure why.
    // This hack makes sure it clicks the right one.
    await this.page.getByTestId('join-existing-game').and(this.page.locator(':visible')).click();
  }

  public async dismissAlertForSmallerScreens() {
    await this.page.getByTestId('dismiss-mobile-mode').click();
  }

  public async enableMobilePhoneMode() {
    await this.page.getByTestId('enable-mobile-mode').click();
  }
}
