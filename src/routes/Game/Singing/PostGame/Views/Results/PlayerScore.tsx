import clsx from 'clsx';
import CountUp from 'react-countup';
import { HighScoreEntity, SingSetup } from '~/interfaces';
import { Badge } from '~/modules/Elements/Badge';
import styles from '~/modules/GameEngine/Drawing/styles';
import { formatter } from '~/routes/Game/Singing/GameOverlay/Components/ScoreText';
import { PlayerScore } from '~/routes/Game/Singing/PostGame/PostGameView';
import PlayerDetailedScore from '~/routes/Game/Singing/PostGame/Views/Results/PlayerDetailedScore';
import { cn } from '~/utils/cn';

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
    <div
      className={cn(
        'relative flex flex-col items-center gap-0 bg-black/50 px-2 py-1 transition-all ease-in-out',
        revealHighScore ? '' : 'mb-4 2xl:mb-6',
      )}>
      <div className="flex w-full flex-1">
        <div
          data-win={revealHighScore && playerScore === highestScore}
          data-test={`player-${playerNumber}-score`}
          data-score={Math.floor(playerScore)}
          className={cn(
            'typography text-md flex flex-1 justify-between bg-transparent text-white transition-[font-size,color] duration-400 ease-in-out 2xl:text-xl',
            isHighScore(player.name) ? 'text-active text-lg 2xl:text-2xl' : '',
          )}>
          <span
            style={{ color: useColors ? styles.colors.players[playerNumber].text : undefined }}
            data-test={`player-${playerNumber}-name`}
            className="ph-no-capture">
            {player.name}
          </span>
          <CountUp preserveValue end={playerScore} formattingFn={formatter.format} duration={segment < 5 ? 1 : 0.5} />
        </div>
      </div>
      <PlayerDetailedScore playerNumber={playerNumber} player={player} segment={segment} />
      <Badge
        data-highscore={revealHighScore && isHighScore(player.name)}
        className={clsx(
          '2xl:text-md right-6 z-2 text-sm opacity-0 transition-opacity duration-[400ms] md:-top-1',
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
