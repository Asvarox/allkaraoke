import styled from '@emotion/styled';
import { GAME_MODE, HighScoreEntity, SingSetup } from 'interfaces';
import CameraManager from 'modules/Camera/CameraManager';
import { Button } from 'modules/Elements/Button';
import { sumDetailedScore } from 'modules/GameEngine/GameState/Helpers/calculateScore';
import useKeyboard from 'modules/hooks/useKeyboard';
import useKeyboardHelp from 'modules/hooks/useKeyboardHelp';
import posthog from 'posthog-js';
import { useEffect, useMemo, useState } from 'react';
import { PlayerScore } from 'routes/Game/Singing/PostGame/PostGameView';
import CameraRoll from 'routes/Game/Singing/PostGame/Views/Results/CameraRoll';
import PlayerScoreView from 'routes/Game/Singing/PostGame/Views/Results/PlayerScore';

interface Props {
  onNextStep: () => void;
  players: PlayerScore[];
  highScores: HighScoreEntity[];
  singSetup: SingSetup;
}

function ResultsView({ onNextStep, players, highScores, singSetup }: Props) {
  // -1 so the animation starts from the first segment
  const [segment, setSegment] = useState<number>(-1);

  useEffect(() => {
    if (segment < 0) {
      setSegment(0);
    } else if (segment < 4) {
      const interval = setInterval(() => {
        setSegment((segment) => segment + 1);
      }, 1_500);
      return () => {
        clearInterval(interval);
      };
    }
  }, [segment]);
  const isAnimFinished = segment > 3;

  const nextStep = () => {
    if (!isAnimFinished) {
      posthog.capture('animation_skipped');
      setSegment(5);
    } else {
      onNextStep();
    }
  };

  useKeyboard(
    {
      accept: nextStep,
    },
    true,
    [segment],
  );
  const help = useMemo(
    () => ({
      accept: 'Next',
    }),
    [],
  );
  useKeyboardHelp(help, true);

  const isCoop = singSetup.mode === GAME_MODE.CO_OP;
  const finalPlayers = isCoop ? [{ ...players[0], name: players.map((player) => player.name).join(', ') }] : players;

  const playerScores = finalPlayers.map((player) => sumDetailedScore(player.detailedScore[0]));
  const highestScore = Math.max(...playerScores);

  return (
    <Container>
      <ScoresContainer>
        {finalPlayers.map((player, number) => (
          <PlayerScoreView
            playerNumber={player.playerNumber}
            useColors={!isCoop}
            revealHighScore={segment > 3}
            segment={segment}
            key={number}
            player={player}
            highScores={highScores}
            highestScore={highestScore}
            singSetup={singSetup}
          />
        ))}
      </ScoresContainer>
      <SongSelectionButton
        onClick={nextStep}
        focused
        data-test={isAnimFinished ? 'highscores-button' : 'skip-animation-button'}>
        {isAnimFinished ? 'Next' : 'Skip'}
      </SongSelectionButton>
      {CameraManager.getPermissionStatus() && <StyledPhotoRoll />}
    </Container>
  );
}
const Container = styled.div`
  position: absolute;
  padding: 20rem 15rem 10rem 15rem;
  top: 0;
  height: 100%;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ScoresContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5rem;
  margin-bottom: 15rem;
  flex: 1;
`;

const SongSelectionButton = styled(Button)`
  width: 40rem;
  font-size: 1.9vw;
  margin-left: auto;
`;

const StyledPhotoRoll = styled(CameraRoll)`
  position: absolute;
  top: calc(50% - 30rem);
  left: 95rem;
  transform: scale(0.75);
`;

export default ResultsView;
