import { Browser, BrowserContext, Page } from '@playwright/test';
import { Calibration } from '../components/Calibration';
import { AdvancedConnectionPagePO } from './AdvancedConnectionPage';
import { ComputersMicConnectionPagePO } from './ComputersMicConnectionPage';
import { EditSongsPagePO } from './EditSongsPage';
import { GamePagePO } from './GamePage';
import { InputSelectionPagePO } from './InputSelectionPage';
import { JoinExistingGamePagePO } from './JoinExistingGamePage';
import { JukeboxPagePO } from './JukeboxPage';
import { LandingPagePO } from './LandingPage';
import { MainMenuPagePO } from './MainMenuPage';
import { ManageSetlistsPagePO } from './ManageSetlistsPage';
import { ManageSongsPagePO } from './ManageSongsPage';
import { PostGameHighScoresPagePO } from './PostGameHighScoresPage';
import { PostGameResultsPagePO } from './PostGameResultsPage';
import { RateUnfinishedSongPagePO } from './RateUnfinishedSongPage';
import { RemoteMicMainPagePO } from './RemoteMic/RemoteMicMainPage';
import { SettingsPagePO } from './SettingsPage';
import { SingstarConnectionPagePO } from './SingstarConnectionPage';
import { SmartphonesConnectionPagePO } from './SmartphonesConnectionPage';
import { SongEditAuthorAndVideoPagePO } from './SongEditAuthorAndVideoPage';
import { SongEditBasicInfoPagePO } from './SongEditBasicInfoPage';
import { SongEditMetadataPagePO } from './SongEditMetadataPage';
import { SongEditSyncLyricsToVideoPagePO } from './SongEditSyncLyricsToVideoPage';
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
    songEditBasicInfoPage: new SongEditBasicInfoPagePO(page, context, browser),
    songEditAuthorAndVideoPage: new SongEditAuthorAndVideoPagePO(page, context, browser),
    songEditSyncLyricsToVideoPage: new SongEditSyncLyricsToVideoPagePO(page, context, browser),
    songEditMetadataPage: new SongEditMetadataPagePO(page, context, browser),
    advancedConnectionPage: new AdvancedConnectionPagePO(page, context, browser),
    songPreviewPage: new SongPreviewPagePO(page, context, browser),
    gamePage: new GamePagePO(page, context, browser),
    postGameResultsPage: new PostGameResultsPagePO(page, context, browser),
    postGameHighScoresPage: new PostGameHighScoresPagePO(page, context, browser),
    jukeboxPage: new JukeboxPagePO(page, context, browser),
    remoteMicMainPage: new RemoteMicMainPagePO(page, context, browser),
    singstarConnectionPage: new SingstarConnectionPagePO(page, context, browser),
    computersMicConnectionPage: new ComputersMicConnectionPagePO(page, context, browser),
    joinExistingGamePage: new JoinExistingGamePagePO(page, context, browser),
    settingsPage: new SettingsPagePO(page, context, browser),
    rateUnfinishedSongPage: new RateUnfinishedSongPagePO(page, context, browser),
    calibration: new Calibration(page, context, browser),
    manageSetlists: new ManageSetlistsPagePO(page, context, browser),
  };
}
