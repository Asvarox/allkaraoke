import clsx from 'clsx';
import dayjs from 'dayjs';
import { HighScoreEntity, SingSetup, Song } from '~/interfaces';
import { Button } from '~/modules/Elements/Button';
import { useEditScore } from '~/modules/Songs/stats/hooks';
import useKeyboardNav from '~/modules/hooks/useKeyboardNav';
import ScoreText from '~/routes/Game/Singing/GameOverlay/Components/ScoreText';
import HighScoreRename from './HighScoreRename';

interface Props {
  onNextStep: () => void;
  singSetup: SingSetup;
  highScores: HighScoreEntity[];
  song: Song;
}

function HighScoresView({ onNextStep, highScores, singSetup, song }: Props) {
  const { register } = useKeyboardNav();
  const editScore = useEditScore(song);

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-2 lg:gap-4" data-test="highscores-container">
        {highScores.map((score, index) => (
          <div
            className={clsx(
              'typography lg:text-md relative flex items-center text-sm 2xl:text-lg',
              score.singSetupId === singSetup.id
                ? 'bg-black/90 px-4 py-1 sm:py-0 2xl:py-2'
                : 'bg-black/50 px-4 py-2 sm:py-1 2xl:py-4',
            )}
            key={index}>
            <div className="text-active px-2">{index + 1}</div>

            <div className="ph-no-capture flex-1 p-1 text-left">
              {score.singSetupId === singSetup.id ? (
                <HighScoreRename
                  index={index}
                  score={score}
                  register={register}
                  singSetupId={singSetup.id}
                  onSave={editScore}
                />
              ) : (
                score.name
              )}
            </div>
            <div className="px-1">
              <ScoreText score={score.score} />
            </div>
            <div className="2xl:text-md absolute -right-2 -bottom-2 bg-black px-1 text-xs">
              {dayjs(score.date).format('MMMM D, YYYY')}
            </div>
          </div>
        ))}
      </div>
      <Button
        className="mt-2 w-full lg:mt-6 lg:ml-auto lg:w-5/12"
        size="small"
        {...register('play-next-song-button', onNextStep, undefined, true)}>
        Select song
      </Button>
    </>
  );
}

export default HighScoresView;
