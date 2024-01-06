import { Browser, BrowserContext, Page } from '@playwright/test';
import { AdvancedConnectionPagePO } from './AdvancedConnectionPage';
import { EditSongsPagePO } from './EditSongsPage';
import { GamePagePO } from './GamePage';
import { InputSelectionPagePO } from './InputSelectionPage';
import { LandingPagePO } from './LandingPage';
import { MainMenuPagePO } from './MainMenuPage';
import { ManageSongsPagePO } from './ManageSongsPage';
import { PostGamePO } from './PostGame';
import { SmartphonesConnectionPagePO } from './SmartphonesConnectionPage';
import { SongEditingPagePO } from './SongEditingPage';
import { SongLanguagesPagePO } from './SongLanguagesPage';
import { SongListPagePO } from './SongListPage';
import { SongPreviewPagePO } from './SongPreviewPage';

export default function initialise(page: Page, context: BrowserContext, browser: Browser) {
  return {
    landingPage: new LandingPagePO(page, context, browser),
    inputSelectionPage: new InputSelectionPagePO(page, context, browser),
    mainMenuPage: new MainMenuPagePO(page, context, browser),
    songLanguagesPage: new SongLanguagesPagePO(page, context, browser),
    songListPage: new SongListPagePO(page, context, browser),
    smartphonesConnectionPage: new SmartphonesConnectionPagePO(page, context, browser),
    manageSongsPage: new ManageSongsPagePO(page, context, browser),
    editSongsPage: new EditSongsPagePO(page, context, browser),
    songEditingPage: new SongEditingPagePO(page, context, browser),
    advancedConnectionPage: new AdvancedConnectionPagePO(page, context, browser),
    songPreviewPage: new SongPreviewPagePO(page, context, browser),
    gamePage: new GamePagePO(page, context, browser),
    postGame: new PostGamePO(page, context, browser),
  };
}
