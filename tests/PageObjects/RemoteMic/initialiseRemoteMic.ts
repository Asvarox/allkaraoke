import { Browser, BrowserContext, Page } from '@playwright/test';
import { RemoteTabBar } from '../RemoteMic/remoteComponents/RemoteTabBar';
import { RemoteToolbar } from '../RemoteMic/remoteComponents/RemoteToolbar';
import { RemoteMicSongListPagePO } from '././RemoteMicSongListPage';
import { RemoteMicMainPagePO } from './RemoteMicMainPage';
import { RemoteMicManageGamePage } from './RemoteMicManageGamePage';
import { RemoteMicManagePlayerPage } from './RemoteMicManagePlayerPage';
import { RemoteMicSettingsPage } from './RemoteMicSettingsPage';
import { RemoteMicSongLanguagesPagePO } from './RemoteMicSongLanguagesPage';

export default function initialiseRemoteMic(page: Page, context: BrowserContext, browser: Browser) {
  return {
    remoteMicMainPage: new RemoteMicMainPagePO(page, context, browser),
    remoteMicSongListPage: new RemoteMicSongListPagePO(page, context, browser),
    remoteMicSettingsPage: new RemoteMicSettingsPage(page, context, browser),
    remoteMicManageGamePage: new RemoteMicManageGamePage(page, context, browser),
    remoteMicManagePlayerPage: new RemoteMicManagePlayerPage(page, context, browser),
    remoteMicSongLanguagesPage: new RemoteMicSongLanguagesPagePO(page, context, browser),
    _page: page,
    remoteToolbar: new RemoteToolbar(page, context, browser),
    remoteTabBar: new RemoteTabBar(page, context, browser),
  };
}
