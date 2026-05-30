import { Browser, BrowserContext, Page } from '@playwright/test';
import { RemoteMicChangeMicColorPagePO } from './remote-mic-change-mic-color-page';
import { RemoteMicMainPagePO } from './remote-mic-main-page';
import { RemoteMicManageGamePage } from './remote-mic-manage-game-page';
import { RemoteMicManagePlayerPage } from './remote-mic-manage-player-page';
import { RemoteMicSettingsPage } from './remote-mic-settings-page';
import { RemoteMicSongLanguagesPagePO } from './remote-mic-song-languages-page';
import { RemoteMicSongListPagePO } from './remote-mic-song-list-page';

export default function initialiseRemoteMic(page: Page, context: BrowserContext, browser: Browser) {
  return {
    remoteMicMainPage: new RemoteMicMainPagePO(page, context, browser),
    remoteMicSongListPage: new RemoteMicSongListPagePO(page, context, browser),
    remoteMicSettingsPage: new RemoteMicSettingsPage(page, context, browser),
    remoteMicManageGamePage: new RemoteMicManageGamePage(page, context, browser),
    remoteMicManagePlayerPage: new RemoteMicManagePlayerPage(page, context, browser),
    remoteMicSongLanguagesPage: new RemoteMicSongLanguagesPagePO(page, context, browser),
    remoteMicChangeMicColorPage: new RemoteMicChangeMicColorPagePO(page, context, browser),
    _page: page,
  };
}

export type RemoteMicPages = ReturnType<typeof initialiseRemoteMic>;
