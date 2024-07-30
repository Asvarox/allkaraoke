import { Browser, BrowserContext, Page } from '@playwright/test';
import { RemoteMicMainPagePO } from './RemoteMicMainPage';
import { RemoteSongListPagePO } from './RemoteSongListPage';

export default function initialiseRemoteMic(page: Page, context: BrowserContext, browser: Browser) {
  return {
    remoteMicMainPage: new RemoteMicMainPagePO(page, context, browser),
    remoteSongListPage: new RemoteSongListPagePO(page, context, browser),
    _page: page,
  };
}
