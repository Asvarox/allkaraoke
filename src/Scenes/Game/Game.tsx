import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { SongPreview } from '../../interfaces';
import Singing from './Singing/Singing';
import SongSelection from './SongSelection/SongSelection';

function Game() {
    const [selectedSong, setSelectedSong] = useState<SongPreview | null>(null);

    useEffect(() => {
        document.body.requestFullscreen();
    }, [])

    return (
        <>
            <FullscreenButton onClick={() => document.body.requestFullscreen()}>Fullscreen</FullscreenButton>
            {selectedSong ? (
                <Singing songPreview={selectedSong} returnToSongSelection={() => setSelectedSong(null)} />
            ) : (
                <SongSelection onSongSelected={(preview) => setSelectedSong(preview)} />
            )}
        </>
    )
}

const FullscreenButton = styled.div`
    cursor: pointer;
    background: rgba(0, 0, 0, .5);
    color: white;
    padding: 10px;
    margin: 0 10px;
    position: absolute;
    top: 0;
    right: 0;
`

export default Game;
