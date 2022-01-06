import { useState } from 'react';
import { SongPreview } from '../../interfaces';
import Singing from './Singing/Singing';
import SongSelection from './SongSelection/SongSelection';

function Game() {
    const [selectedSong, setSelectedSong] = useState<SongPreview | null>(null);

    if (!selectedSong) {
        return <SongSelection onSongSelected={preview => setSelectedSong(preview)} />
    } else {
        return <Singing songPreview={selectedSong} returnToSongSelection={() => setSelectedSong(null)} />
    }
}

export default Game;
