import dayjs from 'dayjs';

import { HighScoreEntity, SingSetup, Song } from '~/interfaces';
import { Button } from '~/modules/elements/akui/button';
import { Icon } from '~/modules/elements/akui/icon';
import useKeyboardNav, { RegisterFunc } from '~/modules/hooks/use-keyboard-nav';
import ScoreboardPanel from '~/modules/scoreboard/scoreboard-panel';
import ScoreboardRow from '~/modules/scoreboard/scoreboard-row';
import { useEditScore } from '~/modules/songs/stats/hooks';
import LeaderboardPrompt from '~/routes/game/singing/post-game/views/leaderboard/leaderboard-prompt';
import LeaderboardSharePanel from '~/routes/game/singing/post-game/views/leaderboard/leaderboard-share-panel';
import SongLeaderboardPanel from '~/routes/game/singing/post-game/views/leaderboard/song-leaderboard-panel';
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
      {/* The two boards sit side by side once there is room for two columns; below that the global
          one follows the local one.
          The right padding keeps the pair clear of the keyboard-help overlay, which is fixed to the
          top-right of every screen (`help-view.tsx`) and would otherwise print itself over the board
          — this step is the only one whose content reaches that corner. */}
      <div className="flex min-h-0 flex-1 flex-col items-start gap-3 lg:flex-row lg:items-stretch lg:gap-6 lg:pr-[25rem]">
        <ScoreboardPanel title="Local scoreboard" subtitle="This song · this device" data-test="highscores-container">
          {highScores.map((score, index) => {
            const isCurrentRun = score.singSetupId === singSetup.id;

            return (
              <ScoreboardRow
                key={index}
                position={index + 1}
                score={score.score}
                highlighted={isCurrentRun}
                // The score just sung and its date are the only rows that change between runs — named
                // so the visual baselines can mask them and keep the seeded rows visible
                data-test={isCurrentRun ? 'highscore-current-row' : undefined}
                name={
                  isCurrentRun ? (
                    <HighScoreRename
                      index={index}
                      score={score}
                      register={register}
                      singSetupId={singSetup.id}
                      onSave={editScore}
                    />
                  ) : (
                    score.name
                  )
                }
                meta={dayjs(score.date).format('MMM D, YYYY')}
              />
            );
          })}
        </ScoreboardPanel>
        <SongLeaderboardPanel song={song} singSetup={singSetup} leaderboard={leaderboard} />
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
