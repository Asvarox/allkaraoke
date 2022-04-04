import styled from 'styled-components';
import { Route, Router } from 'wouter';
import useHashLocation from './Hooks/useHashLocation';
import { GAME_MODE } from './interfaces';
import ConnectPhone from './Scenes/ConnectPhone/ConnectPhone';
import Convert from './Scenes/Convert/Convert';
import Edit from './Scenes/Edit/Edit';
import SongList from './Scenes/Edit/SongList';
import Game from './Scenes/Game/Game';
import { blueFill, blueStroke, redFill, redStroke } from './Scenes/Game/Singing/GameOverlay/Drawing/styles';
import Singing from './Scenes/Game/Singing/Singing';
import Jukebox from './Scenes/Jukebox/Jukebox';
import Phone from './Scenes/Phone/Phone';
import SelectInput from './Scenes/SelectInput/SelectInput';
import Welcome from './Scenes/Welcome/Welcome';

function App() {
    return (
        <>
            <Background />
            <FullscreenButton
                onClick={() => {
                    try {
                        document.body.requestFullscreen().catch(console.info);
                    } catch (e) {}
                }}>
                Fullscreen
            </FullscreenButton>
            <Router hook={useHashLocation}>
                <Route path="/game">{() => <Game />}</Route>
                <Route path="/game/:file">{({ file }) => <Game file={decodeURIComponent(file)} />}</Route>
                <Route path="/test-player">
                    {() => (
                        <Singing
                            singSetup={{
                                mode: GAME_MODE.DUEL,
                                playerTracks: [0, 0],
                                tolerance: 2,
                            }}
                            songFile="dummy.json"
                            video=":)"
                            returnToSongSelection={() => window.location.reload()}
                        />
                    )}
                </Route>
                <Route path="/convert" component={Convert} />
                <Route path="/jukebox" component={Jukebox} />

                <Route path="/connect-phone" component={ConnectPhone} />
                <Route path="/phone/:roomId">{({ roomId }) => <Phone roomId={roomId} />}</Route>

                <Route path="/edit" component={SongList} />
                <Route path="/edit/:filename">{({ filename }) => <Edit file={filename} />}</Route>
                <Route path="/select-input" component={SelectInput} />
                <Route path="/" component={Welcome} />
            </Router>
        </>
    );
}

const Background = styled.div`
    z-index: -1;
    top: 0;
    position: fixed;
    background: white;
    background: linear-gradient(277deg, ${redStroke()} 0%, ${redFill()} 15%, ${blueFill()} 15%, ${blueStroke()} 100%);
    width: 100vw;
    height: 100vh;
`;

const FullscreenButton = styled.div`
    cursor: pointer;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 10px;
    margin: 0 10px;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10000;
`;

export default App;
