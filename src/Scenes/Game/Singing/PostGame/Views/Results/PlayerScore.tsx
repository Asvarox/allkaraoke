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
  playerNumber: number;
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
      <ScoreTextPlayer
        color={useColors ? styles.colors.players[playerNumber].text : ``}
        data-test={`player-${playerNumber}-name`}
        className="ph-no-capture">
        {player.name}
      </ScoreTextPlayer>
      <ScoreTextContainer>
        <ScoreTextScore
          highscore={revealHighScore && isHighScore(player.name)}
          color={useColors ? styles.colors.players[playerNumber].text : ``}
          win={revealHighScore && playerScore === highestScore}
          data-test={`player-${playerNumber}-score`}
          data-score={playerScore}>
          <CountUp preserveValue end={playerScore} formattingFn={formatter.format} duration={segment < 5 ? 1 : 0.5} />
          <HighScoreBadge highscore={revealHighScore && isHighScore(player.name)}>High score!</HighScoreBadge>
        </ScoreTextScore>
      </ScoreTextContainer>
      <PlayerDetailedScore playerNumber={playerNumber} player={player} segment={segment} />
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const ScoreTextPlayer = styled(ContentElement)<{ color: string }>`
  padding-left: 10rem;
  padding-right: 10rem;
  font-size: 3.5rem;
  color: ${(props) => props.color};
`;

const ScoreTextScore = styled(ScoreTextPlayer)<{
  win: boolean;
  highscore: boolean;
  color: string;
}>`
  font-size: ${(props) => (props.win ? '8.5rem' : '5.5rem')};
  color: ${(props) => (props.win ? styles.colors.text.active : 'white')};
  transition: 400ms ease-in-out;
  position: relative;
`;

const ScoreTextContainer = styled.div`
  height: 8.5rem;
`;

const HighScoreBadge = styled(Badge)<{ highscore: boolean }>`
  top: -1.5rem;
  right: -10rem;
  font-size: 3rem;
  ${(props) => props.highscore && buttonFocused};

  opacity: ${(props) => (props.highscore ? '1' : '0')};
  transition: 400ms;
`;

export default PlayerScoreView;
