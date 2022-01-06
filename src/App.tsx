import { Route, Router } from 'wouter';
import Convert from './Scenes/Convert/Convert';
import Game from './Scenes/Game/Game';
import Singing from './Scenes/Game/Singing/Singing';
import Welcome from './Scenes/Welcome/App';
import useHashLocation from './useHashLocation';

function App() {
    return <Router hook={useHashLocation}>
        <Route path="/game" component={Game} />
        <Route path="/test-player">
            {() => <Singing songPreview={{ file: 'dummy.json'} as any} returnToSongSelection={() => window.location.reload()} />}
        </Route>
        <Route path="/convert" component={Convert} />
        <Route path="/" component={Welcome} />
    </Router>
}

export default App;
