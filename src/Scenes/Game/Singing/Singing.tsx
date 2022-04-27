import useFullscreen from 'hooks/useFullscreen';
import { GAME_MODE, SingSetup, Song } from 'interfaces';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import YouTube from 'react-youtube';
import styled from 'styled-components';
import TransitionWrapper from '../../../Elements/TransitionWrapper';
import useViewportSize from '../../../hooks/useViewportSize';
import addHeadstart from '../../Edit/Helpers/addHeadstart';
import normaliseGap from '../../Edit/Helpers/normaliseGap';
import normaliseLyricSpaces from '../../Edit/Helpers/normaliseLyricSpaces';
import normaliseSectionPaddings from '../../Edit/Helpers/normaliseSectionPaddings';
import generatePlayerChanges from './Helpers/generatePlayerChanges';
import Player from './Player';
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
    const song = useQuery<Song>(
        ['song', songFile],
        () => fetch(`./songs/${songFile}`).then((response) => response.json()),
        { staleTime: Infinity, select: processSong },
    );
    useFullscreen();
    const { width, height } = useViewportSize();
    const [isEnded, setIsEnded] = useState(false);
    const [playerState, setPlayerState] = useState(YouTube.PlayerState.UNSTARTED);

    const playerChanges = useMemo(() => {
        if (!song.data) return [];
        if (singSetup.mode !== GAME_MODE.PASS_THE_MIC) return song.data.tracks.map(() => []);

        return generatePlayerChanges(song.data);
    }, [song.data, singSetup]);

    if (!width || !height || !song.data) return <>Loading</>;

    if (isEnded) {
        return <PostGame width={width} height={height} song={song.data} onClickSongSelection={returnToSongSelection} />;
    } else {
        return (
            <Container>
                <BackgroundContainer>
                    <TransitionWrapper show={playerState === YouTube.PlayerState.UNSTARTED}>
                        <Overlay video={video} width={width} height={height} />
                    </TransitionWrapper>
                </BackgroundContainer>
                <Player
                    onStatusChange={setPlayerState}
                    playerChanges={playerChanges}
                    tracksForPlayers={singSetup.playerTracks}
                    song={song.data}
                    width={width}
                    height={height}
                    autoplay
                    onSongEnd={() => {
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

const Overlay = styled.div.attrs<{ video: string; width: number; height: number }>((props) => ({
    style: {
        backgroundImage: `url('https://i3.ytimg.com/vi/${props.video}/hqdefault.jpg')`,
        width: `${props.width}px`,
        height: `${props.height}px`,
    },
}))<{ video: string; width: number; height: number }>`
    background-size: cover;
    background-position: center center;
    filter: blur(10px);
`;

export default Singing;
