import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Button, buttonFocused } from 'Elements/Button';
import useKeyboard from 'hooks/useKeyboard';
import { DetailedScore, HighScoreEntity } from 'interfaces';
import { useEffect, useState } from 'react';
import ScoreText from 'Scenes/Game/Singing/GameOverlay/Components/ScoreText';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { MAX_POINTS, sumDetailedScore } from 'Scenes/Game/Singing/GameState/Helpers/calculateScore';
import { ContentElement } from 'Scenes/Game/SongPage';

interface PlayerScore {
    detailedScore: [number, DetailedScore, DetailedScore];
    name: string;
}

interface Props {
    onNextStep: () => void;
    players: PlayerScore[];
    singSetupId: string;
    highScores: HighScoreEntity[];
}

const MAX_TICKS = Math.floor(6100 / 16);

const POINTS_PER_TICK = MAX_POINTS / MAX_TICKS;

function ResultsView({ onNextStep, players, highScores, singSetupId }: Props) {
    const [currentTick, setCurrentTick] = useState(0);
    useKeyboard({
        onEnter: onNextStep,
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

    const isHighScore = (playerName: string) =>
        highScores.some((score) => score.singSetupId === singSetupId && score.name === playerName);

    return (
        <>
            <ScoresContainer>
                <ScoreTextPlayer color={styles.colors.players[0].text} data-test="player-1-name">
                    {players[0].name}
                </ScoreTextPlayer>
                <br />
                <ScoreTextScore
                    highscore={currentTick === MAX_TICKS && isHighScore(players[0].name)}
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
                    highscore={currentTick === MAX_TICKS && isHighScore(players[1].name)}
                    color={styles.colors.players[1].text}
                    win={currentTick === MAX_TICKS && player2sum > player1sum}
                    data-test="player-2-score"
                    data-score={player2sum}>
                    <ScoreText score={player2sum} />
                </ScoreTextScore>
                <br />
                <ScoreTextPlayer color={styles.colors.players[1].text} data-test="player-2-name">
                    {players[1].name}
                </ScoreTextPlayer>
            </ScoresContainer>
            <SongSelectionButton onClick={onNextStep} focused data-test="highscores-button">
                Next
            </SongSelectionButton>
        </>
    );
}

const ScoresContainer = styled.div`
    position: absolute;
    top: 20rem;
    width: 100%;
    text-align: center;
`;

const ScoreTextPlayer = styled(ContentElement)<{ color: string }>`
    padding-left: 10rem;
    padding-right: 10rem;
    font-size: 3.5rem;
    color: rgb(${(props) => props.color});
`;

const ScoreTextScore = styled(ScoreTextPlayer)<{ win: boolean; highscore: boolean; color: string }>`
    font-size: ${(props) => (props.win ? '10.5rem' : '5.5rem')};
    color: ${(props) => (props.win ? styles.colors.text.active : 'white')};
    //color: white;
    transition: 400ms ease-in-out;

    ${(props) =>
        props.highscore &&
        css`
            ::after {
                content: 'High score!';
                position: absolute;
                top: -1.5rem;
                right: -10rem;

                font-size: 3rem;
                -webkit-text-stroke: 0.1rem black;
                color: ${styles.colors.text.default};
                padding: 0.5rem 1rem;
                border-radius: 1.5rem;

                ${buttonFocused};
            }
        `};
`;

const SongSelectionButton = styled(Button)<{ focused: boolean }>`
    position: absolute;
    bottom: 4rem;
    right: 2rem;
    width: 40rem;
    font-size: 1.9vw;
`;

export default ResultsView;
