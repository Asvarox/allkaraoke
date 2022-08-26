import LayoutWithBackground from 'Elements/LayoutWithBackground';
import useFullscreen from 'hooks/useFullscreen';
import { SingSetup } from 'interfaces';
import { useState } from 'react';
import TransitionWrapper from '../../Elements/TransitionWrapper';
import Singing from './Singing/Singing';
import SongSelection from './SongSelection/SongSelection';

interface Props {
    file?: string;
}

function Game(props: Props) {
    const [singSetup, setSingSetup] = useState<(SingSetup & { file: string; video: string }) | null>(null);
    const [preselectedSong, setPreselectedSong] = useState<string | null>(props.file ?? null);

    useFullscreen();

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
                <LayoutWithBackground>
                    <SongSelection
                        onSongSelected={(setup) => {
                            setSingSetup(setup);
                        }}
                        preselectedSong={preselectedSong}
                    />
                </LayoutWithBackground>
            </TransitionWrapper>
        </>
    );
}
export default Game;
