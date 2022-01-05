import { useState } from 'react';
import { SongPreview } from '../../interfaces';
import Singing from './Singing/Singing';
import SongSelection from './SongSelection/SongSelection';

function Game() {
    const [selectedSongPath, setSelectedSongPath] = useState<SongPreview | null>(null);

    if (!selectedSongPath) {
        return <SongSelection onSongSelected={preview => setSelectedSongPath(preview)} />
    } else {
        return <Singing songPreview={selectedSongPath} />
    }
}

export default Game;
