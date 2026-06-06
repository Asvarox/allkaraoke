import { Browser, BrowserContext, Page } from '@playwright/test';
import { Calibration } from '../components/calibration';
import { AdminSharedSongsPagePO } from './admin-shared-songs-page';
import { AdvancedConnectionPagePO } from './advanced-connection-page';
import { ComputersMicConnectionPagePO } from './computers-mic-connection-page';
import { EditSongsPagePO } from './edit-songs-page';
import { GamePagePO } from './game-page';
import { HistoryPagePO } from './history-page';
import { InputSelectionPagePO } from './input-selection-page';
import { JoinExistingGamePagePO } from './join-existing-game-page';
import { JukeboxPagePO } from './jukebox-page';
import { LandingPagePO } from './landing-page';
import { MainMenuPagePO } from './main-menu-page';
import { ManageSetlistsPagePO } from './manage-setlists-page';
import { ManageSongsPagePO } from './manage-songs-page';
import { PostGameHighScoresPagePO } from './post-game-high-scores-page';
import { PostGameResultsPagePO } from './post-game-results-page';
import { RateUnfinishedSongPagePO } from './rate-unfinished-song-page';
import { RemoteMicMainPagePO } from './remote-mic/remote-mic-main-page';
import { SettingsPagePO } from './settings-page';
import { SingstarConnectionPagePO } from './singstar-connection-page';
import { SmartphonesConnectionPagePO } from './smartphones-connection-page';
import { SongEditAuthorAndVideoPagePO } from './song-edit-author-and-video-page';
import { SongEditBasicInfoPagePO } from './song-edit-basic-info-page';
import { SongEditMetadataPagePO } from './song-edit-metadata-page';
import { SongEditSyncLyricsToVideoPagePO } from './song-edit-sync-lyrics-to-video-page';
import { SongLanguagesPagePO } from './song-languages-page';
import { SongListPagePO } from './song-list-page';
import { SongPreviewPagePO } from './song-preview-page';

export default function initialise(page: Page, context: BrowserContext, browser: Browser) {
  return {
    landingPage: new LandingPagePO(page, context, browser),
    adminSharedSongsPage: new AdminSharedSongsPagePO(page, context, browser),
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
    historyPage: new HistoryPagePO(page, context, browser),
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
