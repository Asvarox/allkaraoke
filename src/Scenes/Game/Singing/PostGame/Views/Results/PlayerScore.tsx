import styled from '@emotion/styled';
import { buttonFocused } from 'Elements/Button';
import { formatter } from 'Scenes/Game/Singing/GameOverlay/Components/ScoreText';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { MAX_POINTS, sumDetailedScore } from 'Scenes/Game/Singing/GameState/Helpers/calculateScore';
import { PlayerScore } from 'Scenes/Game/Singing/PostGame/PostGameView';
import { ContentElement } from 'Scenes/Game/SongPage';
import { HighScoreEntity, SingSetup } from 'interfaces';
import CountUp from 'react-countup';

interface Props {
  player: PlayerScore;
  revealHighScore: boolean;
  setAnimDone: (playerNumber: number) => void;
  useColors?: boolean;
  playerNumber: number;
  highestScore: number;
  highScores: HighScoreEntity[];
  singSetup: SingSetup;
}

const MAX_POINTS_ANIM_LENGTH = 6;
const MIN_POINTS_ANIM_LENGTH = 3;

function PlayerScoreView({
  playerNumber,
  player,
  highestScore,
  highScores,
  singSetup,
  useColors = true,
  revealHighScore,
  setAnimDone,
}: Props) {
  const playerScore = sumDetailedScore(player.detailedScore[0]);
  const isHighScore = (playerName: string) =>
    highScores.some((score) => score.singSetupId === singSetup.id && score.name === playerName);

  return (
    <>
      <ScoreTextPlayer
        color={useColors ? styles.colors.players[playerNumber].text : ``}
        data-test={`player-${playerNumber}-name`}
        className="ph-no-capture">
        {player.name}
      </ScoreTextPlayer>
      <br />
      <ScoreTextScore
        highscore={revealHighScore && isHighScore(player.name)}
        color={useColors ? styles.colors.players[playerNumber].text : ``}
        win={revealHighScore && playerScore === highestScore}
        data-test={`player-${playerNumber}-score`}
        data-score={playerScore}>
        <CountUp
          end={playerScore}
          formattingFn={formatter.format}
          onEnd={() => setAnimDone(playerNumber)}
          duration={Math.max(MIN_POINTS_ANIM_LENGTH, (playerScore / MAX_POINTS) * MAX_POINTS_ANIM_LENGTH)}
        />
        <HighScoreBadge highscore={revealHighScore && isHighScore(player.name)}>High score!</HighScoreBadge>
      </ScoreTextScore>
      <br />
      <br />
    </>
  );
}

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
  font-size: ${(props) => (props.win ? '10.5rem' : '5.5rem')};
  color: ${(props) => (props.win ? styles.colors.text.active : 'white')};
  //color: white;
  transition: 400ms ease-in-out;
  position: relative;
`;

const HighScoreBadge = styled.span<{ highscore: boolean }>`
  position: absolute;
  top: -1.5rem;
  right: -10rem;

  font-size: 3rem;
  -webkit-text-stroke: 0.1rem black;
  color: ${styles.colors.text.default};
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;

  ${(props) => props.highscore && buttonFocused};

  opacity: ${(props) => (props.highscore ? '1' : '0')};
  transition: 400ms;
`;

export default PlayerScoreView;
