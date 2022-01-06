import { Route, Router } from 'wouter';
import Convert from './Scenes/Convert/Convert';
import Edit from './Scenes/Edit/Edit';
import SongList from './Scenes/Edit/SongList';
import Game from './Scenes/Game/Game';
import Singing from './Scenes/Game/Singing/Singing';
import Welcome from './Scenes/Welcome/Welcome';
import useHashLocation from './useHashLocation';

function App() {
    return (
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
    );
}

export default App;
