import { useState } from 'react';

import { DetailedScore, SingSetup, Song } from '~/interfaces';
import { GameTip } from '~/modules/elements/game-tip';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import { PlayerNumber } from '~/modules/players/player-number';
import ResultsView from '~/routes/game/singing/post-game/views/results';
import { BackgroundThemeSetting, useSettingValue } from '~/routes/settings/settings-state';

import SongPage from '../../song-page';
import HighScoresView from './views/high-scores';
import LeaderboardPrompt from './views/leaderboard-prompt';

export interface PlayerScore {
  detailedScore: [DetailedScore, DetailedScore];
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
  useBackgroundMusic(true);
  const [step, setStep] = useState<'results' | 'highscores'>('results');

  return (
    <SongPage songData={song} width={width} height={height}>
      <div className="flex flex-1 flex-col gap-2" data-test={dataTest}>
        {step === 'results' && (
          <ResultsView
            onNextStep={() => (highScoresEnabled ? setStep('highscores') : onClickSongSelection())}
            players={players}
            singSetup={singSetup}
            highScores={highScores}
            cameraEnabled={cameraEnabled}
          />
        )}
        {step === 'highscores' && (
          <>
            <HighScoresView
              onNextStep={onClickSongSelection}
              singSetup={singSetup}
              highScores={highScores}
              song={song}
            />
            {/* Sibling rather than a child of HighScoresView so its own registration order — the
                `Select song` button last — stays exactly as it is */}
            <LeaderboardPrompt song={song} singSetup={singSetup} />
          </>
        )}
        <GameTip
          data-active="true"
          className={
            'typography block w-full bg-black/75 px-2 py-2 text-center text-xs leading-tight md:text-sm 2xl:text-lg'
          }
        />
        {backgroundTheme !== 'christmas' && (
          <span className="typography text-xs 2xl:text-sm">
            Background music by{' '}
            <a href="https://www.FesliyanStudios.com" target="_blank" rel="noopener noreferrer">
              www.FesliyanStudios.com
            </a>
          </span>
        )}
      </div>
    </SongPage>
  );
}
export default PostGameView;
