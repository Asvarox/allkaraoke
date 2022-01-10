import styled from 'styled-components';
import { Route, Router } from 'wouter';
import Convert from './Scenes/Convert/Convert';
import Edit from './Scenes/Edit/Edit';
import SongList from './Scenes/Edit/SongList';
import Game from './Scenes/Game/Game';
import styles, { blueFill, blueStroke, redFill, redStroke } from './Scenes/Game/Singing/Drawing/styles';
import Singing from './Scenes/Game/Singing/Singing';
import Welcome from './Scenes/Welcome/Welcome';
import useHashLocation from './useHashLocation';

function App() {
    return (
        <>
        <Background />
            <Router hook={useHashLocation}>
                <Route path="/game" component={Game} />
                <Route path="/test-player">
                    {() => (
                        <Singing
                            songPreview={{ file: 'dummy.json' } as any}
                            returnToSongSelection={() => window.location.reload()}
                        />
                    )}
                </Route>
                <Route path="/convert" component={Convert} />
                <Route path="/edit" component={SongList} />
                <Route path="/edit/:filename">{({ filename }) => <Edit file={filename} />}</Route>
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
    background: linear-gradient(277deg, ${redStroke()} 0%, ${redFill()} 50%, ${blueFill()} 50%, ${blueStroke()} 100%);
    width: 100vw;
    height: 100vh;
`;

export default App;
