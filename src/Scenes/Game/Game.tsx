import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SingSetup, SongPreview } from '../../interfaces';
import Singing from './Singing/Singing';
import SongSelection from './SongSelection/SongSelection';

function Game() {
    const [singSetup, setSingSetup] = useState<SingSetup | null>(null);
    const [preselectedSong, setPreselectedSong] = useState<string | null>(null);

    useEffect(() => {
        document.body.requestFullscreen();
    }, [])

    return (
        <>
            <FullscreenButton onClick={() => document.body.requestFullscreen()}>Fullscreen</FullscreenButton>
            {singSetup ? (
                <Singing singSetup={singSetup} returnToSongSelection={() => {
                    setPreselectedSong(singSetup.songPreview.file);
                    setSingSetup(null);
                }} />
            ) : (
                <SongSelection onSongSelected={setSingSetup} preselectedSong={preselectedSong} />
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
    z-index: 10000;
`

export default Game;
