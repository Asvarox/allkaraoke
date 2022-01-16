import { useEffect, useState } from 'react';
import { SingSetup } from '../../interfaces';
import Singing from './Singing/Singing';
import SongSelection from './SongSelection/SongSelection';

interface Props {
    file?: string;
}

function Game(props: Props) {
    const [singSetup, setSingSetup] = useState<SingSetup | null>(null);
    const [preselectedSong, setPreselectedSong] = useState<string | null>(props.file ?? null);

    useEffect(() => {
        document.body.requestFullscreen();
    }, []);

    return (
        <>
            {singSetup ? (
                <Singing
                    singSetup={singSetup}
                    returnToSongSelection={() => {
                        setPreselectedSong(singSetup.songPreview.file);
                        setSingSetup(null);
                    }}
                />
            ) : (
                <SongSelection onSongSelected={setSingSetup} preselectedSong={preselectedSong} />
            )}
        </>
    );
}
export default Game;
