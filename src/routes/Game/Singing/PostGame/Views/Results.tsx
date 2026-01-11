import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { GAME_MODE, HighScoreEntity, SingSetup } from '~/interfaces';
import CameraManager from '~/modules/Camera/CameraManager';
import { Button } from '~/modules/Elements/Button';
import { sumDetailedScore } from '~/modules/GameEngine/GameState/Helpers/calculateScore';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import { PlayerScore } from '~/routes/Game/Singing/PostGame/PostGameView';
import CameraRoll from '~/routes/Game/Singing/PostGame/Views/Results/CameraRoll';
import { CameraRollPlaceholder } from '~/routes/Game/Singing/PostGame/Views/Results/CameraRollPlaceholder';
import PlayerScoreView from '~/routes/Game/Singing/PostGame/Views/Results/PlayerScore';

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

  const initialCameraPermission = useMemo(() => CameraManager.getPermissionStatus(), []);
  // needs to be here to force rerender of Results so Next button is selected after enabling camera
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const enableCamera = () => {
    setIsRequestInProgress(true);
    CameraManager.requestPermissions().then(() => setIsRequestInProgress(false));
  };

  return (
    <div className="mobile:pt-30 mobile:pb-0 absolute inset-0 box-border flex h-full w-full flex-col pt-80 pb-36">
      <div className="mobile:gap-4 flex h-full flex-row gap-10">
        <div
          className={clsx(
            'flex flex-1 flex-col text-center transition-[gap] duration-500',
            revealHighScore ? 'mobile:gap-2 gap-5' : 'mobile:gap-6 gap-12',
          )}
          data-collapse={revealHighScore}>
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
        </div>
        <div
          className={clsx(
            'shrink-0 transition-[width] duration-300',
            initialCameraPermission && revealHighScore ? 'w-5/12' : 'w-1/4',
          )}>
          {initialCameraPermission ? (
            <CameraRoll />
          ) : (
            <CameraRollPlaceholder register={register} onConfirm={enableCamera} loading={isRequestInProgress} />
          )}
        </div>
      </div>
      <Button
        {...register('next-button', () => nextStep(), undefined, true)}
        data-test={isAnimFinished ? 'highscores-button' : 'skip-animation-button'}
        className="mt-auto ml-auto w-96 text-2xl lg:text-3xl xl:text-4xl">
        {isAnimFinished ? 'Next' : 'Skip'}
      </Button>
    </div>
  );
}

export default ResultsView;
