import styled from '@emotion/styled';
import { VideoState } from 'Elements/VideoPlayer';
import useFullscreen from 'hooks/useFullscreen';
import { GAME_MODE, SingSetup, Song } from 'interfaces';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import GameState from 'Scenes/Game/Singing/GameState/GameState';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import calculateScore from 'Scenes/Game/Singing/GameState/Helpers/calculateScore';
import TransitionWrapper from '../../../Elements/TransitionWrapper';
import useViewportSize from '../../../hooks/useViewportSize';
import addHeadstart from '../../Edit/Helpers/addHeadstart';
import normaliseGap from '../../Edit/Helpers/normaliseGap';
import normaliseLyricSpaces from '../../Edit/Helpers/normaliseLyricSpaces';
import normaliseSectionPaddings from '../../Edit/Helpers/normaliseSectionPaddings';
import generatePlayerChanges from './Helpers/generatePlayerChanges';
import Player, { PlayerRef } from './Player';
import PostGame from './PostGame/PostGame';

interface Props {
    video: string;
    songFile: string;
    singSetup: SingSetup;
    returnToSongSelection: () => void;
}

const processSong = (song: Song) => {
    let processed = normaliseGap(song);
    processed = addHeadstart(processed);
    processed = normaliseSectionPaddings(processed);
    processed = normaliseLyricSpaces(processed);

    return processed;
};

function Singing({ video, songFile, singSetup, returnToSongSelection }: Props) {
    const player = useRef<PlayerRef | null>(null);
    const song = useQuery<Song>(
        ['song', songFile],
        () => fetch(`./songs/${songFile}`).then((response) => response.json()),
        { staleTime: Infinity, select: processSong },
    );
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
    useEffect(() => {
        setTimeout(() => {
            setIsTransitionTimeout(true);
            player.current?.play();
        }, 3_000);
    }, []);

    if (!width || !height || !song.data) return <>Loading</>;

    if (isEnded) {
        return <PostGame width={width} height={height} song={song.data} onClickSongSelection={returnToSongSelection} />;
    } else {
        return (
            <Container>
                <BackgroundContainer>
                    <TransitionWrapper show={!isTransitionTimeout && playerState === VideoState.UNSTARTED}>
                        <Overlay video={video} width={width} height={height} />
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
                        const scores = GameState.getPlayers().map((player, index) => ({
                            name: `Player ${index + 1}`,
                            score: calculateScore(player.getPlayerNotes(), song.data, player.getTrackIndex()),
                        }));
                        events.songEnded.dispatch(song.data, singSetup, scores);
                        setIsEnded(true);
                    }}
                    singSetup={singSetup}
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
