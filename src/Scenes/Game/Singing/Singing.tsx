import styled from '@emotion/styled';
import { VideoState } from 'Elements/VideoPlayer';
import useSong from 'Songs/hooks/useSong';
import useFullscreen from 'hooks/useFullscreen';
import { GAME_MODE, SingSetup } from 'interfaces';
import { useEffect, useMemo, useRef, useState } from 'react';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import calculateScore from 'Scenes/Game/Singing/GameState/Helpers/calculateScore';
import TransitionWrapper from '../../../Elements/TransitionWrapper';
import useViewportSize from '../../../hooks/useViewportSize';
import generatePlayerChanges from './Helpers/generatePlayerChanges';
import Player, { PlayerRef } from './Player';
import PostGame from './PostGame/PostGame';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import { typography } from 'Elements/cssMixins';

interface Props {
    video: string;
    songFile: string;
    singSetup: SingSetup;
    returnToSongSelection: () => void;
    restartSong: () => void;
}
function Singing({ video, songFile, singSetup, returnToSongSelection, restartSong }: Props) {
    const player = useRef<PlayerRef | null>(null);
    const song = useSong(songFile);

    useFullscreen();
    const { width, height } = useViewportSize();
    const [isEnded, setIsEnded] = useState(false);
    const [playerState, setPlayerState] = useState(VideoState.UNSTARTED);

    const playerChanges = useMemo(() => {
        if (!song.data) return [];
        if (singSetup.mode !== GAME_MODE.PASS_THE_MIC) return song.data.tracks.map(() => []);

        return generatePlayerChanges(song.data);
    }, [song.data, singSetup]);

    const [isTransitionTimeout, setIsTransitionTimeout] = useState(false);
    const [areAllPlayersReady, setAreAllPlayersReady] = useState(false);
    useEffect(() => {
        const inputsReady = InputManager.requestReadiness().then(() => setAreAllPlayersReady(true));
        const minTimeElapsed = new Promise((resolve) => setTimeout(resolve, 3_000));
        const maxTimeElapsed = new Promise((resolve) => setTimeout(resolve, 10_000));

        Promise.race([Promise.all([inputsReady, minTimeElapsed]), maxTimeElapsed]).then(() => {
            setIsTransitionTimeout(true);
            player.current?.play();
        });
    }, []);

    if (!width || !height || !song.data) return <>Loading</>;

    if (isEnded) {
        return (
            <PostGame
                width={width}
                height={height}
                song={song.data}
                onClickSongSelection={returnToSongSelection}
                singSetup={singSetup}
            />
        );
    } else {
        return (
            <Container>
                <BackgroundContainer>
                    <TransitionWrapper show={!isTransitionTimeout && playerState === VideoState.UNSTARTED}>
                        <>
                            <Overlay video={video} width={width} height={height} />
                            {!areAllPlayersReady && (
                                <WaitingForReady>
                                    <span>
                                        Waiting for all players to click <strong>"Ready"</strong>
                                    </span>
                                </WaitingForReady>
                            )}
                        </>
                    </TransitionWrapper>
                </BackgroundContainer>
                <Player
                    ref={player}
                    onStatusChange={setPlayerState}
                    playerChanges={playerChanges}
                    players={singSetup.players}
                    song={song.data}
                    width={width}
                    height={height}
                    autoplay={false}
                    onSongEnd={() => {
                        const scores = GameState.getPlayers().map((player) => ({
                            name: player.getName(),
                            score: calculateScore(player.getPlayerNotes(), song.data!, player.getTrackIndex()),
                        }));
                        events.songEnded.dispatch(song.data!, singSetup, scores);
                        setIsEnded(true);
                    }}
                    singSetup={singSetup}
                    restartSong={restartSong}
                />
            </Container>
        );
    }
}

const Container = styled.div`
    position: relative;
`;

const WaitingForReady = styled.div`
    top: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 100%;
    height: 100%;

    font-size: 7rem;
    ${typography};
`;

const BackgroundContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: none;
`;

const BaseOverlay = styled.div`
    background-size: cover;
    background-position: center center;
    filter: blur(10px);
`;

const Overlay = (props: { video: string; width: number; height: number }) => (
    <BaseOverlay
        style={{
            backgroundImage: `url('https://i3.ytimg.com/vi/${props.video}/hqdefault.jpg')`,
            width: `${props.width}px`,
            height: `${props.height}px`,
        }}
    />
);

export default Singing;
