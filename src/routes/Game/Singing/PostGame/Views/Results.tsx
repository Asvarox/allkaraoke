import styled from '@emotion/styled';
import { GAME_MODE, HighScoreEntity, SingSetup } from 'interfaces';
import CameraManager from 'modules/Camera/CameraManager';
import { Button } from 'modules/Elements/Button';
import { sumDetailedScore } from 'modules/GameEngine/GameState/Helpers/calculateScore';
import useKeyboardNav from 'modules/hooks/useKeyboardNav';
import { FeatureFlags } from 'modules/utils/featureFlags';
import useFeatureFlag from 'modules/utils/useFeatureFlag';
import posthog from 'posthog-js';
import { useEffect, useMemo, useState } from 'react';
import { PlayerScore } from 'routes/Game/Singing/PostGame/PostGameView';
import CameraRoll from 'routes/Game/Singing/PostGame/Views/Results/CameraRoll';
import { CameraRollPlaceholder } from 'routes/Game/Singing/PostGame/Views/Results/CameraRollPlaceholder';
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

  const { register } = useKeyboardNav();

  const isCoop = singSetup.mode === GAME_MODE.CO_OP;
  const finalPlayers = isCoop ? [{ ...players[0], name: players.map((player) => player.name).join(', ') }] : players;

  const playerScores = finalPlayers.map((player) => sumDetailedScore(player.detailedScore[0]));
  const highestScore = Math.max(...playerScores);

  const revealHighScore = segment > 3;

  const isCameraModeEnabled = useFeatureFlag(FeatureFlags.CameraMode);
  const initialCameraPermission = useMemo(() => CameraManager.getPermissionStatus(), []);
  // needs to be here to force rerender of Results so Next button is selected after enabling camera
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const enableCamera = () => {
    posthog.capture('enable-camera');
    setIsRequestInProgress(true);
    CameraManager.requestPermissions().then(() => setIsRequestInProgress(false));
  };

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
        {isCameraModeEnabled ? (
          <div className="w-[30%]">
            {initialCameraPermission ? (
              <CameraRoll />
            ) : (
              <CameraRollPlaceholder register={register} onConfirm={enableCamera} loading={isRequestInProgress} />
            )}
          </div>
        ) : initialCameraPermission ? (
          <div className="w-[30%]">
            <CameraRoll />
          </div>
        ) : null}
      </div>
      <SongSelectionButton
        {...register('next-button', () => nextStep(), undefined, true)}
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

export default ResultsView;
