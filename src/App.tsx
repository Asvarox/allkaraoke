import styled from '@emotion/styled';
import { KeyboardHelpProvider } from 'Scenes/KeyboardHelp/Context';
import Settings from 'Scenes/Settings/Settings';
import { Route, Router } from 'wouter';
import useHashLocation from './hooks/useHashLocation';
import Convert from './Scenes/Convert/Convert';
import Edit from './Scenes/Edit/Edit';
import SongList from './Scenes/Edit/SongList';
import Game from './Scenes/Game/Game';
import Jukebox from './Scenes/Jukebox/Jukebox';
import Phone from './Scenes/Phone/Phone';
import SelectInput from './Scenes/SelectInput/SelectInput';

import GetSongsBPMs from 'Scenes/Edit/GetSongsBPMs';
import 'Stats';
import QuickSetup from 'Scenes/QuickSetup/QuickSetup';
import { MicSetupPreferenceSetting, useSettingValue } from 'Scenes/Settings/SettingsState';
import Welcome from 'Scenes/Welcome/Welcome';
import isE2E from 'utils/isE2E';

function App() {
    const [setupPreference] = useSettingValue(MicSetupPreferenceSetting);
    return (
        <KeyboardHelpProvider>
            {!isE2E() && (
                <FullscreenButton
                    onClick={() => {
                        try {
                            document.body.requestFullscreen().catch(console.info);
                        } catch (e) {}
                    }}>
                    Fullscreen
                </FullscreenButton>
            )}
            <Router hook={useHashLocation}>
                <Route path="/game">{() => <Game />}</Route>
                <Route path="/game/:file">{({ file }) => <Game file={decodeURIComponent(file)} />}</Route>
                <Route path="/convert" component={() => <Convert />} />
                <Route path="/jukebox" component={Jukebox} />
                <Route path="/phone/:roomId">{({ roomId }) => <Phone roomId={roomId} />}</Route>
                <Route path="/edit" component={SongList} />
                <Route path="/edit/get-songs-bpms" component={GetSongsBPMs} />
                <Route path="/edit/:filename">{({ filename }) => <Edit file={filename} />}</Route>
                <Route path="/select-input" component={SelectInput} />
                <Route path="/settings" component={Settings} />
                {setupPreference === null ? (
                    <Route path="/" component={QuickSetup} />
                ) : (
                    <Route path="/" component={Welcome} />
                )}
            </Router>
        </KeyboardHelpProvider>
    );
}

const FullscreenButton = styled.div`
    cursor: pointer;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 1rem;
    margin: 0 1rem;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10000;
    font-size: 1.5rem;
`;

export default App;
