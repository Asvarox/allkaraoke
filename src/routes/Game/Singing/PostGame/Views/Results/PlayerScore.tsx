import styled from '@emotion/styled';
import CountUp from 'react-countup';
import { HighScoreEntity, SingSetup } from '~/interfaces';
import { Badge } from '~/modules/Elements/Badge';
import { buttonFocused } from '~/modules/Elements/Button';
import styles from '~/modules/GameEngine/Drawing/styles';
import { formatter } from '~/routes/Game/Singing/GameOverlay/Components/ScoreText';
import { PlayerScore } from '~/routes/Game/Singing/PostGame/PostGameView';
import PlayerDetailedScore from '~/routes/Game/Singing/PostGame/Views/Results/PlayerDetailedScore';
import { ContentElement } from '~/routes/Game/SongPage';

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
          data-win={revealHighScore && playerScore === highestScore}
          data-test={`player-${playerNumber}-score`}
          data-score={Math.floor(playerScore)}>
          <ScoreTextPlayer
            color={useColors ? styles.colors.players[playerNumber].text : ``}
            data-test={`player-${playerNumber}-name`}
            className="ph-no-capture">
            {player.name}
          </ScoreTextPlayer>
          <CountUp preserveValue end={playerScore} formattingFn={formatter.format} duration={segment < 5 ? 1 : 0.5} />
        </ScoreTextScore>
      </ScoreTextContainer>
      <PlayerDetailedScore playerNumber={playerNumber} player={player} segment={segment} />
      <HighScoreBadge data-highscore={revealHighScore && isHighScore(player.name)}>High score!</HighScoreBadge>
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
  padding: 1rem 2rem;
  position: relative;
`;

const ScoreTextPlayer = styled.span<{ color: string }>`
  color: ${(props) => props.color};
  font-size: 3.5rem;
`;

const ScoreTextScore = styled(ContentElement)`
  background: transparent;
  font-size: 4.5rem;
  color: white;
  transition: 400ms ease-in-out;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin: 0;
  padding: 0;

  &[data-win='true'] {
    font-size: 7.5rem;
    color: ${styles.colors.text.active};
  }
`;

const ScoreTextContainer = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 7.5rem;
`;

const HighScoreBadge = styled(Badge)`
  font-size: 3rem;
  opacity: 0;
  z-index: 2;

  &[data-highscore='true'] {
    top: -2.5rem;
    right: -4rem;
    ${buttonFocused};
    opacity: 1;
  }

  transition: 400ms;
`;

export default PlayerScoreView;
