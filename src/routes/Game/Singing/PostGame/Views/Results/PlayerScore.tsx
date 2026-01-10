import clsx from 'clsx';
import { HighScoreEntity, SingSetup } from 'interfaces';
import { Badge } from 'modules/Elements/Badge';
import styles from 'modules/GameEngine/Drawing/styles';
import CountUp from 'react-countup';
import { formatter } from 'routes/Game/Singing/GameOverlay/Components/ScoreText';
import { PlayerScore } from 'routes/Game/Singing/PostGame/PostGameView';
import PlayerDetailedScore from 'routes/Game/Singing/PostGame/Views/Results/PlayerDetailedScore';

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
    <div className="mobile:gap-0 relative flex flex-col items-center gap-2 rounded-2xl bg-black/50 px-4 py-2">
      <div className="flex w-full flex-1">
        <div
          data-win={revealHighScore && playerScore === highestScore}
          data-test={`player-${playerNumber}-score`}
          data-score={Math.floor(playerScore)}
          className={clsx(
            'typography items-between mobile:text-md flex flex-1 justify-between bg-transparent text-xl text-white transition-[font-size,color] duration-[400ms] ease-in-out',
            revealHighScore && playerScore === highestScore ? 'text-active mobile:text-lg text-2xl' : '',
          )}>
          <span
            style={{ color: useColors ? styles.colors.players[playerNumber].text : undefined }}
            data-test={`player-${playerNumber}-name`}
            className="ph-no-capture mobile:text-lg text-2xl">
            {player.name}
          </span>
          <CountUp preserveValue end={playerScore} formattingFn={formatter.format} duration={segment < 5 ? 1 : 0.5} />
        </div>
      </div>
      <PlayerDetailedScore playerNumber={playerNumber} player={player} segment={segment} />
      <Badge
        data-highscore={revealHighScore && isHighScore(player.name)}
        className={clsx(
          'text-md mobile:text-sm z-2 opacity-0 transition-opacity duration-[400ms]',
          revealHighScore && isHighScore(player.name)
            ? 'animate-focused bg-active scale-[1.025] opacity-100 shadow-none'
            : '',
        )}>
        High score!
      </Badge>
    </div>
  );
}

export default PlayerScoreView;
