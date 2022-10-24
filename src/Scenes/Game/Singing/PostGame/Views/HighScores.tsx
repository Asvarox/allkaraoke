import styled from '@emotion/styled';
import { format } from 'date-fns';
import { Button } from 'Elements/Button';
import { typography } from 'Elements/cssMixins';
import useKeyboard from 'hooks/useKeyboard';
import { HighScoreEntity } from 'interfaces';
import ScoreText from 'Scenes/Game/Singing/GameOverlay/Components/ScoreText';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';

interface Props {
    onNextStep: () => void;
    singSetupId: string;
    highScores: HighScoreEntity[];
}

function HighScoresView({ onNextStep, highScores, singSetupId }: Props) {
    useKeyboard({
        onEnter: onNextStep,
    });

    return (
        <>
            <ScoresContainer data-test="highscores-container">
                {highScores.map((score, index) => (
                    <ScoreContainer isCurrentSing={score.singSetupId === singSetupId} key={index}>
                        <ScorePosition>{index + 1}</ScorePosition>
                        <ScorePlayerName>{score.name}</ScorePlayerName>
                        <ScoreScore>
                            <ScoreText score={score.score} />
                        </ScoreScore>
                        <ScoreDate>{format(new Date(score.date), 'LLL do y')}</ScoreDate>
                    </ScoreContainer>
                ))}
            </ScoresContainer>
            <SongSelectionButton onClick={onNextStep} focused data-test="play-next-song-button">
                Select song
            </SongSelectionButton>
        </>
    );
}

const ScoresContainer = styled.div`
    position: absolute;
    top: 200px;
    width: 100%;
    text-align: center;
    padding: 0 10em;
    box-sizing: border-box;
`;

const ScoreContainer = styled.div<{ isCurrentSing: boolean }>`
    position: relative;
    ${typography};
    font-size: 2em;
    display: flex;
    background: ${(props) => (props.isCurrentSing ? 'rgba(0,0,0,.9)' : 'rgba(0,0,0,.5)')};
    margin-bottom: 0.5em;
    padding: 0 1em;
`;
const ScorePosition = styled.div`
    padding: 0.5em;
    flex: 0;
    color: ${styles.colors.text.active};
`;
const ScorePlayerName = styled.div`
    text-align: left;
    flex: 1;
    padding: 0.5em;
`;
const ScoreScore = styled.div`
    flex: 0;
    padding: 0.5em;
`;
const ScoreDate = styled.div`
    position: absolute;
    font-size: 0.6em;
    bottom: -0.5em;
    right: -1em;
    background: black;
    flex: 0;
    padding: 0.2em;
`;

const SongSelectionButton = styled(Button)<{ focused: boolean }>`
    position: absolute;
    bottom: 40px;
    right: 20px;
    width: 400px;
    font-size: 1.9vw;
`;

export default HighScoresView;
