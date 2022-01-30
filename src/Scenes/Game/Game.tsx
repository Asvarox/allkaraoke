import { useEffect, useState } from 'react';
import TransitionWrapper from '../../Elements/TransitionWrapper';
import { SingSetup } from '../../interfaces';
import Singing from './Singing/Singing';
import SongSelection from './SongSelection/SongSelection';

interface Props {
    file?: string;
}

function Game(props: Props) {
    const [singSetup, setSingSetup] = useState<(SingSetup & { file: string }) | null>(null);
    const [preselectedSong, setPreselectedSong] = useState<string | null>(props.file ?? null);

    useEffect(() => {
        document.body.requestFullscreen();
    }, []);

    return (
        <>
            <TransitionWrapper show={!!singSetup}>
                {singSetup && (
                    <Singing
                        songFile={singSetup.file}
                        singSetup={singSetup}
                        returnToSongSelection={() => {
                            setPreselectedSong(singSetup.file);
                            setSingSetup(null);
                        }}
                    />
                )}
            </TransitionWrapper>
            <TransitionWrapper show={!singSetup}>
                <SongSelection onSongSelected={setSingSetup} preselectedSong={preselectedSong} />
            </TransitionWrapper>
        </>
    );
}
export default Game;
