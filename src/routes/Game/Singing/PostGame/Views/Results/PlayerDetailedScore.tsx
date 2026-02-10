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
    <div className="relative box-border flex h-8 w-full flex-row gap-1 rounded-xl bg-black/50 p-1 2xl:h-12">
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
      <span className="typography 2xl:text-md absolute top-9 left-2 block text-right text-sm whitespace-nowrap 2xl:top-12">
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
