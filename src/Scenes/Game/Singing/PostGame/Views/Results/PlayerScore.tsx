import styled from '@emotion/styled';
import { Badge } from 'Elements/Badge';
import { buttonFocused } from 'Elements/Button';
import { formatter } from 'Scenes/Game/Singing/GameOverlay/Components/ScoreText';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { PlayerScore } from 'Scenes/Game/Singing/PostGame/PostGameView';
import PlayerDetailedScore from 'Scenes/Game/Singing/PostGame/Views/Results/PlayerDetailedScore';
import { ContentElement } from 'Scenes/Game/SongPage';
import { HighScoreEntity, SingSetup } from 'interfaces';
import CountUp from 'react-countup';

interface Props {
  player: PlayerScore;
  revealHighScore: boolean;
  useColors?: boolean;
  playerNumber: 0 | 1 | 2 | 3;
  segment: number;
  highestScore: number;
  highScores: HighScoreEntity[];
  singSetup: SingSetup;
}

function PlayerScoreView({
  playerNumber,
  player,
  highestScore,
  highScores,
  singSetup,
  useColors = true,
  revealHighScore,
  segment,
}: Props) {
  const [detailedScore] = player.detailedScore;
  let playerScore = 0;
  if (segment > -1) {
    playerScore = detailedScore.normal + detailedScore.rap + detailedScore.freestyle;
  }
  if (segment > 0) {
    playerScore = playerScore + detailedScore.perfect;
  }
  if (segment > 1) {
    playerScore = playerScore + detailedScore.star;
  }
  if (segment > 2) {
    playerScore = playerScore + detailedScore.vibrato;
  }

  const isHighScore = (playerName: string) =>
    highScores.some((score) => score.singSetupId === singSetup.id && score.name === playerName);

  return (
    <Container>
      <ScoreTextContainer>
        <ScoreTextScore
          highscore={revealHighScore && isHighScore(player.name)}
          color={useColors ? styles.colors.players[playerNumber].text : ``}
          win={revealHighScore && playerScore === highestScore}
          data-test={`player-${playerNumber}-score`}
          data-score={playerScore}>
          <ScoreTextPlayer
            color={useColors ? styles.colors.players[playerNumber].text : ``}
            data-test={`player-${playerNumber}-name`}
            className="ph-no-capture">
            {player.name}
          </ScoreTextPlayer>
          <CountUp preserveValue end={playerScore} formattingFn={formatter.format} duration={segment < 5 ? 1 : 0.5} />
          <HighScoreBadge highscore={revealHighScore && isHighScore(player.name)}>High score!</HighScoreBadge>
        </ScoreTextScore>
      </ScoreTextContainer>
      <PlayerDetailedScore playerNumber={playerNumber} player={player} segment={segment} />
    </Container>
  );
}
const Container = styled.div`
  background: rgba(0, 0, 0, 0.5);

  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 1rem;
  gap: 1rem;
  padding: 1rem 2rem 1rem 2rem;
`;

const ScoreTextPlayer = styled.span<{ color: string }>`
  font-size: 4rem;
  color: ${(props) => props.color};
`;

const ScoreTextScore = styled(ContentElement)<{
  win: boolean;
  highscore: boolean;
  color: string;
}>`
  background: transparent;
  font-size: ${(props) => (props.win ? '8.5rem' : '5.5rem')};
  color: ${(props) => (props.win ? styles.colors.text.active : 'white')};
  transition: 400ms ease-in-out;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin: 0;
  padding: 0;
`;

const ScoreTextContainer = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 8.5rem;
`;

const HighScoreBadge = styled(Badge)<{ highscore: boolean }>`
  top: -3.5rem;
  right: -11rem;
  font-size: 3rem;
  ${(props) => props.highscore && buttonFocused};

  opacity: ${(props) => (props.highscore ? '1' : '0')};
  transition: 400ms;
`;

export default PlayerScoreView;
