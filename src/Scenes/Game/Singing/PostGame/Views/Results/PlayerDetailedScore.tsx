import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import { PlayerScore } from 'Scenes/Game/Singing/PostGame/PostGameView';
import ScoreBar from 'Scenes/Game/Singing/PostGame/Views/Results/ScoreBar';
import Typewriter from 'typewriter-effect';

interface Props {
  playerNumber: 0 | 1 | 2 | 3;
  player: PlayerScore;
  segment: number;
}
function PlayerDetailedScore({ playerNumber, player, segment }: Props) {
  const [detailedScore, maxScore] = player.detailedScore;

  return (
    <ScoreBarContainer>
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
      <ScoreDescription>
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
      </ScoreDescription>
    </ScoreBarContainer>
  );
}

const ScoreBarContainer = styled.div`
  position: relative;
  height: 5rem;
  width: 100%;
  display: flex;
  flex-direction: row;
  border-radius: 1rem;
  gap: 0.5rem;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
`;

const ScoreDescription = styled.span`
  position: absolute;
  ${typography};
  font-size: 3rem;
  text-align: right;
  white-space: nowrap;
  top: 6rem;
  left: 1rem;
  display: block;
`;

export default PlayerDetailedScore;
