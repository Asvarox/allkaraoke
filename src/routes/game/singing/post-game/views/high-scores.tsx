import clsx from 'clsx';
import dayjs from 'dayjs';

import { HighScoreEntity, SingSetup, Song } from '~/interfaces';
import { Button } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
import useKeyboardNav, { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import { useEditScore } from '~/modules/songs/stats/hooks';
import ScoreText from '~/routes/game/singing/game-overlay/components/score-text';
import LeaderboardPrompt from '~/routes/game/singing/post-game/views/leaderboard/leaderboard-prompt';
import LeaderboardSharePanel from '~/routes/game/singing/post-game/views/leaderboard/leaderboard-share-panel';
import useLeaderboardPostGame from '~/routes/game/singing/post-game/views/leaderboard/use-leaderboard-post-game';

import HighScoreRename from './high-score-rename';

interface Props {
  onNextStep: () => void;
  singSetup: SingSetup;
  highScores: HighScoreEntity[];
  song: Song;
}

function HighScoresView({ onNextStep, highScores, singSetup, song }: Props) {
  const { register } = useKeyboardNav({ title: 'High scores' });
  const editScore = useEditScore(song);
  const leaderboard = useLeaderboardPostGame({ song, singSetup });

  // An armed score goes up as the player moves on, so the wait is never in their way — the button
  // just holds them for as long as the request takes.
  const isArmed = leaderboard.panel === 'armed';

  const goToNextStep = async () => {
    if (isArmed) await leaderboard.share();

    onNextStep();
  };

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
            // The score just sung and its date are the only rows that change between runs — named so
            // the visual baselines can mask them and keep the seeded rows visible
            data-test={score.singSetupId === singSetup.id ? 'highscore-current-row' : undefined}
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
      <LeaderboardSharePanel register={register} leaderboard={leaderboard} />
      <div className="mt-auto">
        <SelectSongButton
          register={register}
          onClick={goToNextStep}
          label={isArmed ? 'Share score and sing a song' : 'Select song'}
          isSubmitting={leaderboard.isSubmitting}
        />
      </div>
      <LeaderboardPrompt leaderboard={leaderboard} />
    </>
  );
}

interface SelectSongButtonProps {
  register: RegisterFunc;
  onClick: () => void;
  label: string;
  isSubmitting: boolean;
}

/**
 * Its own component so `register` runs during THIS render rather than the parent's — otherwise it
 * would be registered before the rename fields above it, putting it first in arrow navigation and in
 * the control list mirrored to the remote mic instead of last, where it appears on screen.
 */
function SelectSongButton({ register, onClick, label, isSubmitting }: SelectSongButtonProps) {
  return (
    <Button
      className="mt-2 w-full lg:mt-6 lg:ml-auto lg:w-5/12"
      size="small"
      // Kept off the register spread: a disabled registration returns no props at all, and the e2e
      // and the remote both need this button findable while the score is in flight.
      data-test="play-next-song-button"
      leftIcon={isSubmitting ? <Icon icon="ic:baseline-refresh" className="motion-safe:animate-spin" /> : undefined}
      {...register('play-next-song-button', onClick, undefined, true, {
        disabled: isSubmitting,
        control: { type: 'button', label },
      })}>
      {isSubmitting ? 'Sharing…' : label}
    </Button>
  );
}

export default HighScoresView;
