// import './App.css';

// import song from './songs/dummy.json';
// import song from './songs/netflix-toss-a-coin-to-your-witcher.json';

import { useState } from 'react';
import { Song, SongPreview } from './interfaces';
import Convert from './Scenes/Convert/Convert';
import Singing from './Scenes/Singing/Singing';
import SongSelection from './Scenes/SongSelection/SongSelection';

function App() {
    const [selectedSongPath, setSelectedSongPath] = useState<SongPreview | null>(null);

    if (window.location.search === '?convert') {
        return <Convert />;
    }

    if (!selectedSongPath) {
        return <SongSelection onSongSelected={preview => setSelectedSongPath(preview)} />
    } else {
        return <Singing songPreview={selectedSongPath} />
    }
}

export default App;
