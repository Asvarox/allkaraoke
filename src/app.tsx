import { ErrorBoundary } from '@sentry/react';
import { Route, Router, Switch } from 'wouter';
import { KeyboardHelpProvider } from '~/routes/keyboard-help/context';
import RemoteMic from '~/routes/remote-mic/remote-mic';
import Settings from '~/routes/settings/settings';
import Convert from './routes/convert/convert';
import Edit from './routes/edit/edit';
import Jukebox from './routes/jukebox/jukebox';
import SelectInput from './routes/select-input/select-input';

import { Theme, ThemeProvider, createTheme } from '@mui/material/styles';
import { Suspense, lazy, useEffect, useMemo } from 'react';
import { ErrorFallback } from '~/modules/elements/error-fallback';
import LayoutWithBackgroundProvider from '~/modules/elements/layout-with-background';
import PageLoader from '~/modules/elements/page-loader';
import useMobileModeDisabled from '~/modules/hooks/use-mobile-mode-disabled';
import GetSongsBPMs from '~/routes/edit/get-songs-bp-ms';
import ExcludeLanguages from '~/routes/exclude-languages/exclude-languages';
import Game from '~/routes/game/game';
import LandingPage from '~/routes/landing-page/landing-page';
import ManageSongs from '~/routes/manage-songs/manage-songs';
import QuickSetup from '~/routes/quick-setup/quick-setup';
import routePaths from '~/routes/route-paths';
import { CalibrationSettings } from '~/routes/settings/calibration';
import RemoteMicSettings from '~/routes/settings/remote-mic-settings';
import { GraphicSetting, MobilePhoneModeSetting, useSettingValue } from '~/routes/settings/settings-state';
import SocialMediaElements from '~/routes/social-media-elements/social-media-elements';
import Welcome from '~/routes/welcome/welcome';

const LazySongList = lazy(() =>
  import('~/routes/manage-songs/song-management').then((modules) => ({ default: modules.SongList })),
);
const LazyAdmin = lazy(() => import('~/routes/admin/admin'));
const LazyOnline = lazy(() => import('~/routes/online/online'));
const LazyHistory = lazy(() => import('~/routes/history/history-page'));
const LazySetlist = lazy(() => import('~/routes/edit/setlists').then((modules) => ({ default: modules.default })));

// Commenting this out as there are many failed to fetch errors coming from Googlebot
// // This is a hack to preload the game scene so that it's ready when the user clicks on the game button
// // without increasing initial load time. Vite doesn't support prefetch yet
// // https://github.com/vitejs/vite/issues/10600
// const prefetchGame = import('./routes/game/game');
// const LazyGame = lazy(() => prefetchGame);

function App() {
  const [graphicSetting] = useSettingValue(GraphicSetting);

  const mobileModeDisabled = useMobileModeDisabled();
  const [mobilePhoneMode, setMobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  useEffect(() => {
    // Force it off for users who opted in before the flag loaded, or in a previous session,
    // while the disable-mobile-mode experiment is running.
    if (mobileModeDisabled && mobilePhoneMode) {
      setMobilePhoneMode(false);
    }
  }, [mobileModeDisabled, mobilePhoneMode, setMobilePhoneMode]);

  const theme = useMemo<Theme>(
    () =>
      createTheme({
        graphicSetting,
      }),
    [graphicSetting],
  );

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary fallback={ErrorFallback}>
        <LayoutWithBackgroundProvider>
          <KeyboardHelpProvider>
            <Router base={import.meta.env.BASE_URL}>
              <Switch>
                <Route path={routePaths.QUICK_SETUP} component={QuickSetup} />
                <Route path={routePaths.MENU} component={Welcome} />
                <Route path={routePaths.EXCLUDE_LANGUAGES} component={ExcludeLanguages} />
                <Route path={routePaths.JUKEBOX} component={Jukebox} />
                <Route
                  path={routePaths.HISTORY}
                  component={() => (
                    <Suspense fallback={<PageLoader />}>
                      <LazyHistory />
                    </Suspense>
                  )}
                />
                <Route path={routePaths.GAME}>
                  {/*<Suspense fallback={<PageLoader />}><LazyGame /></Suspense>*/}
                  <Game />
                </Route>
                <Route
                  path={routePaths.ONLINE}
                  component={() => (
                    <Suspense fallback={<PageLoader />}>
                      <LazyOnline />
                    </Suspense>
                  )}
                />
                <Route path={routePaths.SELECT_INPUT} component={SelectInput} />
                <Route path={routePaths.SETTINGS} component={Settings} />
                <Route path={routePaths.SETTINGS_REMOTE_MICS} component={RemoteMicSettings} />
                <Route path={routePaths.SETTINGS_CALIBRATION} component={CalibrationSettings} />
                <Route path={routePaths.REMOTE_MIC} component={RemoteMic} />
                <Route path={routePaths.MANAGE_SONGS} component={ManageSongs} />
                <Route
                  path={routePaths.ADMIN}
                  component={() => (
                    <Suspense fallback={<PageLoader />}>
                      <LazyAdmin />
                    </Suspense>
                  )}
                />
                <Route path="social-media-elements" component={SocialMediaElements} />
                <Route path={routePaths.CONVERT} component={() => <Convert />} />
                <Route
                  path={routePaths.EDIT_SONGS_LIST}
                  component={() => (
                    <Suspense fallback={<PageLoader />}>
                      <LazySongList />
                    </Suspense>
                  )}
                />
                <Route path="edit/get-songs-bpms" component={GetSongsBPMs} />
                <Route path={routePaths.EDIT_SONG}>
                  <Edit />
                </Route>
                <Route
                  path={routePaths.EDIT_SETLISTS}
                  component={() => (
                    <Suspense fallback={<PageLoader />}>
                      <LazySetlist />
                    </Suspense>
                  )}
                />
                <Route path={routePaths.INDEX} component={LandingPage} />
              </Switch>
            </Router>
          </KeyboardHelpProvider>
        </LayoutWithBackgroundProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
