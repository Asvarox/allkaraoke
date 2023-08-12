import CameraManager from 'Camera/CameraManager';
import SingASong from 'Scenes/SingASong/SingASong';
import useFullscreen from 'hooks/useFullscreen';
import { SingSetup } from 'interfaces';
import { useCallback, useState } from 'react';
import TransitionWrapper from '../../Elements/TransitionWrapper';
import Singing from './Singing/Singing';

interface Props {
    songId?: string;
}

function Game(props: Props) {
    const [singSetup, setSingSetup] = useState<(SingSetup & { songId: string; video: string }) | null>(null);
    const [preselectedSong, setPreselectedSong] = useState<string | null>(props.songId ?? null);
    const [resetKey, setResetKey] = useState(0);

    const handleSelect = useCallback(
        (setup: SingSetup & { songId: string; video: string }) => {
            setSingSetup(setup);
        },
        [setSingSetup],
    );

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
                        songId={singSetup.songId}
                        singSetup={singSetup}
                        returnToSongSelection={() => {
                            setPreselectedSong(singSetup.songId);
                            setSingSetup(null);
                        }}
                    />
                )}
            </TransitionWrapper>
            <TransitionWrapper show={!singSetup}>
                <SingASong onSongSelected={handleSelect} preselectedSong={preselectedSong} />
            </TransitionWrapper>
        </>
    );
}
export default Game;
