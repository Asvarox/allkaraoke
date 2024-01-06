import { Browser, BrowserContext, Page } from '@playwright/test';
import { EditSongsPagePO } from './EditSongsPage';
import { InputSelectionPagePO } from './InputSelectionPage';
import { LandingPagePO } from './LandingPage';
import { MainMenuPagePO } from './MainMenuPage';
import { ManageSongsPagePO } from './ManageSongsPage';
import { SongLanguagesPagePO } from './SongLanguagesPage';
import { SongListPagePO } from './SongListPage';
import { UseSmartphonesConnectionPagePO } from './UseSmartphonesConnectionPage';

export default function initialise(page: Page, context: BrowserContext, browser: Browser) {
  return {
    landingPage: new LandingPagePO(page, context, browser),
    inputSelectionPage: new InputSelectionPagePO(page, context, browser),
    mainMenuPage: new MainMenuPagePO(page, context, browser),
    songLanguagesPage: new SongLanguagesPagePO(page, context, browser),
    songListPage: new SongListPagePO(page, context, browser),
    useSmartphonesConnectionPage: new UseSmartphonesConnectionPagePO(page, context, browser),
    manageSongsPage: new ManageSongsPagePO(page, context, browser),
    editSongsPage: new EditSongsPagePO(page, context, browser),
  };
}
