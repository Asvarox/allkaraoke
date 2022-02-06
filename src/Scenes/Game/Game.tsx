import { useEffect, useState } from 'react';
import TransitionWrapper from '../../Elements/TransitionWrapper';
import { SingSetup } from '../../interfaces';
import Singing from './Singing/Singing';
import SongSelection from './SongSelection/SongSelection';

interface Props {
    file?: string;
}

function Game(props: Props) {
    const [singSetup, setSingSetup] = useState<(SingSetup & { file: string; video: string }) | null>(null);
    const [preselectedSong, setPreselectedSong] = useState<string | null>(props.file ?? null);

    useEffect(() => {
        try {
            process.env.NODE_ENV !== 'development' && document.body.requestFullscreen().catch(console.info);
        } catch (e) {}
    }, []);

    return (
        <>
            <TransitionWrapper show={!!singSetup}>
                {singSetup && (
                    <Singing
                        video={singSetup.video}
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
