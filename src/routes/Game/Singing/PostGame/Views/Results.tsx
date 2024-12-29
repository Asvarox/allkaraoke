import styled from '@emotion/styled';
import { GAME_MODE, HighScoreEntity, SingSetup } from 'interfaces';
import CameraManager from 'modules/Camera/CameraManager';
import { Button } from 'modules/Elements/Button';
import { sumDetailedScore } from 'modules/GameEngine/GameState/Helpers/calculateScore';
import useKeyboard from 'modules/hooks/useKeyboard';
import useKeyboardHelp from 'modules/hooks/useKeyboardHelp';
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

  const revealHighScore = segment > 3;

  return (
    <Container>
      <div className="flex flex-row gap-10">
        <ScoresContainer data-collapse={revealHighScore}>
          {finalPlayers.map((player, number) => (
            <PlayerScoreView
              playerNumber={player.playerNumber}
              useColors={!isCoop}
              revealHighScore={revealHighScore}
              segment={segment}
              key={number}
              player={player}
              highScores={highScores}
              highestScore={highestScore}
              singSetup={singSetup}
            />
          ))}
        </ScoresContainer>
        {CameraManager.getPermissionStatus() && <StyledPhotoRoll />}
      </div>
      <SongSelectionButton
        onClick={nextStep}
        focused
        data-test={isAnimFinished ? 'highscores-button' : 'skip-animation-button'}>
        {isAnimFinished ? 'Next' : 'Skip'}
      </SongSelectionButton>
    </Container>
  );
}
const Container = styled.div`
  position: absolute;
  padding: 20rem 5rem 15rem 5rem;
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
  flex: 1;

  &[data-collapse='true'] {
    gap: 2rem;
  }

  transition: gap 0.5s;
`;

const SongSelectionButton = styled(Button)`
  width: 40rem;
  font-size: 1.9vw;
  margin-left: auto;
  margin-top: auto;
`;

const StyledPhotoRoll = styled(CameraRoll)``;

export default ResultsView;
