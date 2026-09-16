import { useState } from 'react';

import { DetailedScore, SingSetup, Song } from '~/interfaces';
import Box from '~/modules/elements/akui/primitives/box';
import { useBackground } from '~/modules/elements/background-context';
import { GameTip } from '~/modules/elements/game-tip';
import { ScoreTimeline } from '~/modules/game-engine/game-state/helpers/calculate-score-timeline';
import { gameModeNames } from '~/modules/game-modes';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import { difficultyName } from '~/modules/leaderboard/difficulty';
import { PlayerNumber } from '~/modules/players/player-number';
import { useSongsPlayedToday } from '~/routes/game/singing/post-game/songs-played-today';
import ResultsView from '~/routes/game/singing/post-game/views/results';
import { BackgroundThemeSetting, useSettingValue } from '~/routes/settings/settings-state';
import { cn } from '~/utils/cn';

import HighScoresView from './views/high-scores';

export interface PlayerScore {
  detailedScore: [DetailedScore, DetailedScore];
  /**
   * The running score across the song, for the results reveal to animate through. Optional because
   * online play only sends the final totals over the wire — without it the reveal falls back to a
   * straight ramp from zero to those totals.
   */
  scoreTimeline?: ScoreTimeline;
  playerNumber: PlayerNumber;
  name: string;
}

interface HighScoreEntity {
  singSetupId: string;
  name: string;
  score: number;
  date: string;
}

interface Props {
  width: number;
  height: number;
  song: Song;
  onClickSongSelection: () => void;
  players: PlayerScore[];
  singSetup: SingSetup;
  highScores: HighScoreEntity[];
  /** Online games are not persisted to local high scores, so there is no high-score step to advance to. */
  highScoresEnabled?: boolean;
  /** Online mode hides the camera roll — the singers are not in the same room. */
  cameraEnabled?: boolean;
  'data-test'?: string;
}

function PostGameView({
  song,
  width,
  height,
  onClickSongSelection,
  players,
  highScores,
  singSetup,
  highScoresEnabled = true,
  cameraEnabled = true,
  'data-test': dataTest,
}: Props) {
  const [backgroundTheme] = useSettingValue(BackgroundThemeSetting);
  // The singing screen hides the app background behind the video and nothing on the way here turns
  // it back on — this screen stopped painting the song thumbnail, so without this it sits on bare
  // black. The theme is the one song selection picked for this song (a Christmas song keeps its
  // snow), which singing does not preserve on its own.
  useBackground(true, backgroundTheme);
  useBackgroundMusic(true);
  const [step, setStep] = useState<'results' | 'highscores'>('results');
  // `highScoresEnabled` is the same signal as "this game was saved locally": online play sets it
  // false precisely because its results never reach local storage, which is where the round count is
  // read from.
  const round = useSongsPlayedToday(highScoresEnabled);

  return (
    <div className="relative overflow-y-auto" style={{ width, height }}>
      <div className="text-default relative mx-auto flex h-full max-w-440 flex-col px-4">
        {/* `items-baseline` so the credit line sits on the title's own line rather than at the top
            of the block — the column's first baseline is the title's. */}
        <div className="text-default pointer-events-none mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="flex flex-col items-start gap-1">
            <HeaderText className="text-active mt-2 text-lg font-bold lg:text-xl 2xl:mt-5 2xl:text-3xl">
              {song.title}
            </HeaderText>
            <HeaderText className="text-md font-bold lg:text-lg 2xl:text-2xl">{song.artist}</HeaderText>
          </div>
          <HeaderText className="text-inactive 2xl:text-md shrink-0 text-right text-xs">
            {song.author && (
              <>
                Chart by {song.authorUrl ? <a href={song.authorUrl}>{song.author}</a> : song.author}
                {' · '}
              </>
            )}
            {gameModeNames[singSetup.mode]} · {difficultyName(singSetup.tolerance)}
            {round !== null && <> · round {round} of the night</>}
          </HeaderText>
        </div>
        {/* `min-h-0` so a step whose content is taller than the page shrinks inside it rather than
          growing past the bottom — a flex item defaults to `min-height: auto` and will not. The
          high-scores step relies on it: its boards give up height so the button stays on screen. */}
        <div className="flex min-h-0 flex-1 flex-col gap-2" data-test={dataTest}>
          {step === 'results' && (
            <ResultsView
              onNextStep={() => (highScoresEnabled ? setStep('highscores') : onClickSongSelection())}
              players={players}
              singSetup={singSetup}
              cameraEnabled={cameraEnabled}
            />
          )}
          {step === 'highscores' && (
            <HighScoresView
              onNextStep={onClickSongSelection}
              singSetup={singSetup}
              highScores={highScores}
              song={song}
            />
          )}
          <Box className="w-full shrink-0 px-2 py-2">
            <GameTip
              data-active="true"
              className="typography block text-center text-xs leading-tight md:text-sm 2xl:text-lg"
            />
          </Box>
          {backgroundTheme !== 'christmas' && (
            <span className="typography text-xs 2xl:text-sm">
              Background music by{' '}
              <a href="https://www.FesliyanStudios.com" target="_blank" rel="noopener noreferrer">
                www.FesliyanStudios.com
              </a>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Title, artist and credit line. `text-shadow-legible` rather than a plate behind the text, so the
 * page's own background still reads through. */
const HeaderText = ({ className, ...restProps }: React.ComponentProps<'span'>) => (
  <span className={cn('typography text-shadow-legible inline-block', className)} {...restProps} />
);

export default PostGameView;
