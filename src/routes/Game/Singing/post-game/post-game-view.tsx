import { useState } from 'react';
import { DetailedScore, SingSetup, Song } from '~/interfaces';
import { GameTip } from '~/modules/elements/game-tip';
import useBackgroundMusic from '~/modules/hooks/use-background-music';
import ResultsView from '~/routes/game/singing/post-game/views/results';
import { BackgroundThemeSetting, useSettingValue } from '~/routes/settings/settings-state';
import SongPage from '../../song-page';
import HighScoresView from './views/high-scores';

export interface PlayerScore {
  detailedScore: [DetailedScore, DetailedScore];
  playerNumber: 0 | 1 | 2 | 3;
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
}

function PostGameView({ song, width, height, onClickSongSelection, players, highScores, singSetup }: Props) {
  const [backgroundTheme] = useSettingValue(BackgroundThemeSetting);
  useBackgroundMusic(true);
  const [step, setStep] = useState<'results' | 'highscores'>('results');

  return (
    <SongPage songData={song} width={width} height={height}>
      <div className="flex flex-1 flex-col gap-2">
        {step === 'results' && (
          <ResultsView
            onNextStep={() => setStep('highscores')}
            players={players}
            singSetup={singSetup}
            highScores={highScores}
          />
        )}
        {step === 'highscores' && (
          <HighScoresView onNextStep={onClickSongSelection} singSetup={singSetup} highScores={highScores} song={song} />
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
