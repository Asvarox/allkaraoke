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
      <div
        className="mobile:top-30 mobile:px-0 absolute top-62 box-border w-full px-40 text-center"
        data-test="highscores-container">
        {highScores.map((score, index) => (
          <div
            className={clsx(
              'typography mobile:mb-1 mobile:text-sm relative mb-5 flex items-center text-xl',
              score.singSetupId === singSetup.id
                ? 'mobile:px-2 bg-black/90 px-4 py-0'
                : 'mobile:px-4 mobile:py-0 bg-black/50 px-8 py-2',
            )}
            key={index}>
            <div className="text-active mobile:px-2 px-4">{index + 1}</div>

            <div className="ph-no-capture mobile:p-1 flex-1 p-4 text-left">
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
            <div className="mobile:px-1 px-2">
              <ScoreText score={score.score} />
            </div>
            <div className="text-md mobile:text-xs mobile:p-0.5 absolute -right-4 -bottom-3 bg-black p-1.5">
              {dayjs(score.date).format('MMMM D, YYYY')}
            </div>
          </div>
        ))}
      </div>
      <Button
        className="mobile:bottom-5 mobile:h-10 mobile:right-0 absolute right-5 bottom-32 px-8 text-xl"
        {...register('play-next-song-button', onNextStep, undefined, true)}>
        Select song
      </Button>
    </>
  );
}

export default HighScoresView;
