import styled from '@emotion/styled';
import { useBackground } from 'Elements/LayoutWithBackground';
import { VideoState } from 'Elements/VideoPlayer';
import events from 'GameEvents/GameEvents';
import PlayersManager from 'Players/PlayersManager';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import WaitForReadiness from 'Scenes/Game/Singing/WaitForReadiness';
import useSong from 'Songs/hooks/useSong';
import useBlockScroll from 'hooks/useBlockScroll';
import useFullscreen from 'hooks/useFullscreen';
import { GAME_MODE, SingSetup } from 'interfaces';
import { useMemo, useRef, useState } from 'react';
import TransitionWrapper from '../../../Elements/TransitionWrapper';
import useViewportSize from '../../../hooks/useViewportSize';
import generatePlayerChanges from './Helpers/generatePlayerChanges';
import Player, { PlayerRef } from './Player';
import PostGame from './PostGame/PostGame';

interface Props {
    video: string;
    songId: string;
    singSetup: SingSetup;
    returnToSongSelection: () => void;
    restartSong: () => void;
}
function Singing({ video, songId, singSetup, returnToSongSelection, restartSong }: Props) {
    useFullscreen();
    useBlockScroll();
    const player = useRef<PlayerRef | null>(null);
    const song = useSong(songId);

    const { width, height } = useViewportSize();
    const [isEnded, setIsEnded] = useState(false);
    const [playerState, setPlayerState] = useState(VideoState.UNSTARTED);

    const playerChanges = useMemo(() => {
        if (!song.data) return [];
        if (singSetup.mode !== GAME_MODE.PASS_THE_MIC) return song.data.tracks.map(() => []);

        return generatePlayerChanges(song.data);
    }, [song.data, singSetup]);

    const [isTransitionTimeout, setIsTransitionTimeout] = useState(false);

    useBackground(!isTransitionTimeout);

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
                            <WaitForReadiness
                                onFinish={() => {
                                    setIsTransitionTimeout(true);
                                    player.current?.play();
                                }}
                            />
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
                        const scores =
                            GameState.getSingSetup()?.mode === GAME_MODE.CO_OP
                                ? [
                                      {
                                          name: PlayersManager.getPlayers()
                                              .map((player) => player.getName())
                                              .join(', '),
                                          score: GameState.getPlayerScore(0),
                                      },
                                  ]
                                : PlayersManager.getPlayers().map((player) => ({
                                      name: player.getName(),
                                      score: GameState.getPlayerScore(player.number),
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
