import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import useKeyboard from 'hooks/useKeyboard';
import { DetailedScore, Song } from 'interfaces';
import { SyntheticEvent, useEffect, useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import SongPage, { ContentElement } from '../../SongPage';
import ScoreText from '../GameOverlay/Components/ScoreText';
import { MAX_POINTS, sumDetailedScore } from '../GameState/Helpers/calculateScore';
import backgroundMusic from './421888__b-sean__retro.mp3';

interface PlayerScore {
    detailedScore: [number, DetailedScore, DetailedScore];
    name: string;
}
interface Props {
    width: number;
    height: number;
    song: Song;
    onClickSongSelection: () => void;
    players: PlayerScore[];
}

const MAX_TICKS = Math.floor(6100 / 16);

const POINTS_PER_TICK = MAX_POINTS / MAX_TICKS;

function PostGameView({ song, width, height, onClickSongSelection, players }: Props) {
    const [currentTick, setCurrentTick] = useState(0);
    useKeyboard({
        onEnter: onClickSongSelection,
    });

    useEffect(() => {
        if (currentTick >= MAX_TICKS) return;
        const timeout = setTimeout(() => setCurrentTick((tick) => tick + 1), 16);

        return () => clearTimeout(timeout);
    }, [currentTick]);

    const getPlayerScoreText = ([pointsPerBeat, counts]: [number, DetailedScore, DetailedScore]) =>
        Math.min(sumDetailedScore(counts) * pointsPerBeat, POINTS_PER_TICK * currentTick);

    const player1sum = getPlayerScoreText(players[0].detailedScore);
    const player2sum = getPlayerScoreText(players[1].detailedScore);

    return (
        <SongPage songData={song} width={width} height={height}>
            <ScoresContainer>
                <ScoreTextPlayer color={styles.colors.players[0].text}>Player #1</ScoreTextPlayer>
                <br />
                <ScoreTextScore
                    color={styles.colors.players[0].text}
                    win={currentTick === MAX_TICKS && player1sum > player2sum}
                    data-test="player-1-score"
                    data-score={player1sum}>
                    <ScoreText score={player1sum} />
                </ScoreTextScore>
                <br /> {/* xD */}
                <br />
                <br />
                <br />
                <ScoreTextScore
                    color={styles.colors.players[1].text}
                    win={currentTick === MAX_TICKS && player2sum > player1sum}
                    data-test="player-2-score"
                    data-score={player2sum}>
                    <ScoreText score={player2sum} />
                </ScoreTextScore>
                <br />
                <ScoreTextPlayer color={styles.colors.players[1].text}>Player #2</ScoreTextPlayer>
            </ScoresContainer>
            <SongSelectionButton onClick={onClickSongSelection} focused data-test="play-next-song-button">
                Select song
            </SongSelectionButton>
            <audio
                src={backgroundMusic}
                loop
                hidden
                autoPlay
                onPlay={(e: SyntheticEvent<HTMLAudioElement>) => {
                    e.currentTarget.volume = 0.4;
                }}
            />
        </SongPage>
    );
}

const ScoresContainer = styled.div`
    position: absolute;
    top: 200px;
    width: 100%;
    text-align: center;
`;

const ScoreTextPlayer = styled(ContentElement)<{ color: string }>`
    padding-left: 100px;
    padding-right: 100px;
    font-size: 35px;
    color: rgb(${(props) => props.color});
`;

const ScoreTextScore = styled(ScoreTextPlayer)<{ win: boolean; color: string }>`
    font-size: ${(props) => (props.win ? '105px' : '55px')};
    color: ${(props) => (props.win ? styles.colors.text.active : 'white')};
    //color: white;
    transition: 400ms ease-in-out;
`;

const SongSelectionButton = styled(Button)<{ focused: boolean }>`
    position: absolute;
    bottom: 40px;
    right: 20px;
    width: 400px;
    font-size: 1.9vw;
`;

export default PostGameView;
