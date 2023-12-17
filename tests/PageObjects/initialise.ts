import { Browser, BrowserContext, Page } from '@playwright/test';
import { LandingPagePO } from './LandingPage';

export default function initialise(page: Page, context: BrowserContext, browser: Browser) {
  return {
    landingPage: new LandingPagePO(page, context, browser),
  };
}
