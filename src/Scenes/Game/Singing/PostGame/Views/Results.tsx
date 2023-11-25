import styled from '@emotion/styled';
import CameraManager from 'Camera/CameraManager';
import { Button } from 'Elements/Button';
import { sumDetailedScore } from 'Scenes/Game/Singing/GameState/Helpers/calculateScore';
import { PlayerScore } from 'Scenes/Game/Singing/PostGame/PostGameView';
import CameraRoll from 'Scenes/Game/Singing/PostGame/Views/Results/CameraRoll';
import PlayerScoreView from 'Scenes/Game/Singing/PostGame/Views/Results/PlayerScore';
import useKeyboard from 'hooks/useKeyboard';
import useKeyboardHelp from 'hooks/useKeyboardHelp';
import { GAME_MODE, HighScoreEntity, SingSetup } from 'interfaces';
import posthog from 'posthog-js';
import { useEffect, useMemo, useState } from 'react';

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
    <>
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
    </>
  );
}

const ScoresContainer = styled.div`
  position: absolute;
  top: 20rem;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SongSelectionButton = styled(Button)<{ focused: boolean }>`
  position: absolute;
  bottom: 4rem;
  right: 2rem;
  width: 40rem;
  font-size: 1.9vw;
`;

const StyledPhotoRoll = styled(CameraRoll)`
  position: absolute;
  top: calc(50% - 30rem);
  left: 95rem;
  transform: scale(0.75);
`;

export default ResultsView;
