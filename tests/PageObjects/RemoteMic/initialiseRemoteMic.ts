import { Browser, BrowserContext, Page } from '@playwright/test';
import { RemoteMicMainPagePO } from './RemoteMicMainPage';

export default function initialiseRemoteMic(page: Page, context: BrowserContext, browser: Browser) {
  return {
    remoteMicMainPage: new RemoteMicMainPagePO(page, context, browser),
    _page: page,
  };
}
