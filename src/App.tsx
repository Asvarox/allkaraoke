import { ErrorBoundary, withProfiler } from '@sentry/react';
import { KeyboardHelpProvider } from 'Scenes/KeyboardHelp/Context';
import RemoteMic from 'Scenes/RemoteMic/RemoteMic';
import Settings from 'Scenes/Settings/Settings';
import { Route, Router } from 'wouter';
import Convert from './Scenes/Convert/Convert';
import Edit from './Scenes/Edit/Edit';
import Jukebox from './Scenes/Jukebox/Jukebox';
import SelectInput from './Scenes/SelectInput/SelectInput';

import { Global, css } from '@emotion/react';
import { Theme, ThemeProvider, createTheme } from '@mui/material/styles';
import { ErrorFallback } from 'Elements/ErrorFallback';
import LayoutWithBackgroundProvider from 'Elements/LayoutWithBackground';
import PageLoader from 'Elements/PageLoader';
import GetSongsBPMs from 'Scenes/Edit/GetSongsBPMs';
import ExcludeLanguages from 'Scenes/ExcludeLanguages/ExcludeLanguages';
import Game from 'Scenes/Game/Game';
import LandingPage from 'Scenes/LandingPage/LandingPage';
import ManageSongs from 'Scenes/ManageSongs/ManageSongs';
import QuickSetup from 'Scenes/QuickSetup/QuickSetup';
import RemoteMicSettings from 'Scenes/Settings/RemoteMicSettings';
import { GraphicSetting, MobilePhoneModeSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import SocialMediaElements from 'Scenes/SocialMediaElements/SocialMediaElements';
import Welcome from 'Scenes/Welcome/Welcome';
import { Suspense, lazy, useMemo } from 'react';
import routePaths from 'routePaths';

const LazySongList = lazy(() => import('./Scenes/Edit/SongList'));

// Commenting this out as there are many failed to fetch errors coming from Googlebot
// // This is a hack to preload the game scene so that it's ready when the user clicks on the game button
// // without increasing initial load time. Vite doesn't support prefetch yet
// // https://github.com/vitejs/vite/issues/10600
// const prefetchGame = import('./Scenes/Game/Game');
// const LazyGame = lazy(() => prefetchGame);

function App() {
  const [mobilePhoneMode] = useSettingValue(MobilePhoneModeSetting);
  const [graphicSetting] = useSettingValue(GraphicSetting);

  const theme = useMemo<Theme>(
    () =>
      createTheme({
        graphicSetting,
      }),
    [graphicSetting],
  );

  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          :root {
            --zoom-multipler: ${mobilePhoneMode ? 1.4 : 1};
          }
        `}
      />
      <ErrorBoundary fallback={ErrorFallback}>
        <LayoutWithBackgroundProvider>
          <KeyboardHelpProvider>
            <Router base={import.meta.env.BASE_URL}>
              <Route path={routePaths.INDEX} component={LandingPage} />
              <Route path={routePaths.QUICK_SETUP} component={QuickSetup} />
              <Route path={routePaths.MENU} component={Welcome} />
              <Route path={routePaths.EXCLUDE_LANGUAGES} component={ExcludeLanguages} />
              <Route path={routePaths.JUKEBOX} component={Jukebox} />
              <Route path={routePaths.GAME}>
                {/*<Suspense fallback={<PageLoader />}><LazyGame /></Suspense>*/}
                <Game />
              </Route>
              <Route path={routePaths.SELECT_INPUT} component={SelectInput} />
              <Route path={routePaths.SETTINGS} component={Settings} />
              <Route path={routePaths.SETTINGS_REMOTE_MICS} component={RemoteMicSettings} />
              <Route path={routePaths.REMOTE_MIC} component={RemoteMic} />
              <Route path={routePaths.MANAGE_SONGS} component={ManageSongs} />
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
            </Router>
          </KeyboardHelpProvider>
        </LayoutWithBackgroundProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default withProfiler(App);
