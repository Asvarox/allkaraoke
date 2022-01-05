// import './App.css';

// import song from './songs/dummy.json';
// import song from './songs/netflix-toss-a-coin-to-your-witcher.json';

import { useState } from 'react';
import { Route, Router } from 'wouter';
import { Song, SongPreview } from './interfaces';
import Convert from './Scenes/Convert/Convert';
import Game from './Scenes/Game/Game';
import Welcome from './Scenes/Welcome/App';
import useHashLocation from './useHashLocation';

function App() {
    return <Router hook={useHashLocation}>
        <Route path="/game" component={Game} />
        <Route path="/convert" component={Convert} />
        <Route path="/" component={Welcome} />
    </Router>
}

export default App;
