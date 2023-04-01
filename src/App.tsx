import styled from '@emotion/styled';
import { KeyboardHelpProvider } from 'Scenes/KeyboardHelp/Context';
import Settings from 'Scenes/Settings/Settings';
import { Redirect, Route, Router, useLocation } from 'wouter';
import Convert from './Scenes/Convert/Convert';
import Edit from './Scenes/Edit/Edit';
import SongList from './Scenes/Edit/SongList';
import Game from './Scenes/Game/Game';
import Jukebox from './Scenes/Jukebox/Jukebox';
import RemoteMic from 'Scenes/RemoteMic/RemoteMic';
import SelectInput from './Scenes/SelectInput/SelectInput';
import * as Sentry from '@sentry/react';

import GetSongsBPMs from 'Scenes/Edit/GetSongsBPMs';
import QuickSetup from 'Scenes/QuickSetup/QuickSetup';
import { MicSetupPreferenceSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import Welcome from 'Scenes/Welcome/Welcome';
import styles from 'styles';
import { ErrorFallback } from 'Elements/ErrorFallback';
import Toolbar from 'Toolbar/Toolbar';
import ExcludeLanguages from 'Scenes/ExcludeLanguages/ExcludeLanguages';
import ManageSongs from 'Scenes/ManageSongs/ManageSongs';
import LayoutWithBackgroundProvider from 'Elements/LayoutWithBackground';
import { useEffect } from 'react';

function App() {
    const [setupPreference] = useSettingValue(MicSetupPreferenceSetting);
    const [location, navigate] = useLocation();

    useEffect(() => {
        if (setupPreference === null && location === '/') {
            navigate('/quick-setup');
        } else if (setupPreference !== null && location === '/quick-setup') {
            navigate('/');
        }
    }, []);

    return (
        <>
            <Sentry.ErrorBoundary fallback={ErrorFallback}>
                <LayoutWithBackgroundProvider>
                    <KeyboardHelpProvider>
                        <Router>
                            <GameScreens>
                                <Toolbar />
                                <Route path="/game/:file?">
                                    {({ file }) => <Game file={file ? decodeURIComponent(file) : undefined} />}
                                </Route>
                                <Route path="/jukebox" component={Jukebox} />
                                <Route path="/remote-mic/:roomId">
                                    {({ roomId }) => <RemoteMic roomId={roomId!} />}
                                </Route>
                                <Route path="/phone/:roomId">
                                    {({ roomId }) => <Redirect to={`/remote-mic/${roomId}`} />}
                                </Route>
                                <Route path="/quick-setup" component={QuickSetup} />
                                <Route path="/select-input" component={SelectInput} />
                                <Route path="/settings" component={Settings} />
                                <Route path="/manage-songs" component={ManageSongs} />
                                <Route path="/exclude-languages" component={ExcludeLanguages} />
                                <Route path="/" component={Welcome} />
                            </GameScreens>
                            <Route path="/convert" component={() => <Convert />} />
                            <Route path="/edit" component={SongList} />
                            <Route path="/edit/get-songs-bpms" component={GetSongsBPMs} />
                            <Route path="/edit/:filename">{({ filename }) => <Edit file={filename!} />}</Route>
                        </Router>
                    </KeyboardHelpProvider>
                </LayoutWithBackgroundProvider>
            </Sentry.ErrorBoundary>
        </>
    );
}

const GameScreens = styled.div`
    ${styles};
`;

export default App;
