import Typewriter from 'typewriter-effect';
import styles from '~/modules/GameEngine/Drawing/styles';
import { PlayerScore } from '~/routes/Game/Singing/PostGame/PostGameView';
import ScoreBar from '~/routes/Game/Singing/PostGame/Views/Results/ScoreBar';

interface Props {
  playerNumber: 0 | 1 | 2 | 3;
  player: PlayerScore;
  segment: number;
}
function PlayerDetailedScore({ playerNumber, player, segment }: Props) {
  const [detailedScore, maxScore] = player.detailedScore;

  return (
    <div className="mobile:h-10 mobile:p-1 mobile:gap-1 mobile:rounded-xl relative box-border flex h-14 w-full flex-row gap-2 rounded-2xl bg-black/50 p-2">
      <ScoreBar
        score={segment > -1 ? detailedScore.rap + detailedScore.freestyle + detailedScore.normal : 0}
        maxScore={maxScore.rap + maxScore.freestyle + maxScore.normal}
        color={styles.colors.players[playerNumber].perfect.fill}
      />

      <ScoreBar
        score={segment > 0 ? detailedScore.perfect : 0}
        maxScore={maxScore.perfect}
        color={styles.colors.players[playerNumber].stroke}
      />

      <ScoreBar
        score={segment > 1 ? detailedScore.star : 0}
        maxScore={maxScore.star}
        color={styles.colors.players[playerNumber].starPerfect.stroke}
      />

      <ScoreBar
        score={segment > 2 ? detailedScore.vibrato : 0}
        maxScore={maxScore.vibrato}
        color={styles.colors.players[playerNumber].perfect.stroke}
      />
      <span className="typography mobile:text-sm absolute top-14 left-4 block text-right text-xl whitespace-nowrap">
        {segment < 5 && (
          <Typewriter
            options={{
              strings: [
                'Regular notes',
                'Perfect notes',
                'Star notes',
                'Vibrato',
                // "",
              ],
              // @ts-expect-error missing in types
              pauseFor: 1_000,
              autoStart: true,
              // loop: true,
              delay: 15,
              deleteSpeed: 15,
              cursor: '',
            }}
          />
        )}
      </span>
    </div>
  );
}

export default PlayerDetailedScore;
