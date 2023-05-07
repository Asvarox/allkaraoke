import useFullscreen from 'hooks/useFullscreen';
import { SingSetup } from 'interfaces';
import { useState } from 'react';
import TransitionWrapper from '../../Elements/TransitionWrapper';
import Singing from './Singing/Singing';
import SingASong from 'Scenes/SingASong/SingASong';
import CameraManager from 'Camera/CameraManager';

interface Props {
    file?: string;
}

function Game(props: Props) {
    const [singSetup, setSingSetup] = useState<(SingSetup & { file: string; video: string }) | null>(null);
    const [preselectedSong, setPreselectedSong] = useState<string | null>(props.file ?? null);
    const [resetKey, setResetKey] = useState(0);

    useFullscreen();

    return (
        <>
            <TransitionWrapper show={!!singSetup}>
                {singSetup && (
                    <Singing
                        restartSong={() => {
                            CameraManager.restartRecord();
                            setResetKey((current) => current + 1);
                        }}
                        key={resetKey}
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
                <SingASong
                    onSongSelected={(setup) => {
                        setSingSetup(setup);
                    }}
                    preselectedSong={preselectedSong}
                />
            </TransitionWrapper>
        </>
    );
}
export default Game;
