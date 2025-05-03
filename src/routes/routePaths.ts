/*
This map is used to generate the folder structure during the build process.
If a path is not added here, the refresh will rely on 404.html to redirect to index.html,
which makes the search engines not index the page.
 */

const routePaths = {
  INDEX: '',
  QUICK_SETUP: 'quick-setup',
  GAME: 'game',
  MENU: 'menu',
  JUKEBOX: 'jukebox',
  SELECT_INPUT: 'select-input',
  SETTINGS: 'settings',
  SETTINGS_REMOTE_MICS: 'settings/remote-mics',
  SETTINGS_CALIBRATION: 'settings/calibration',
  REMOTE_MIC: 'remote-mic',
  MANAGE_SONGS: 'manage-songs',
  EXCLUDE_LANGUAGES: 'exclude-languages',
  CONVERT: 'convert',
  EDIT_SONGS_LIST: 'edit/list',
  EDIT_SONG: 'edit/song',
  EDIT_SETLISTS: 'edit/setlists',
} as const;

export default routePaths;
