import { DetailedScore, SingSetup, Song } from 'interfaces';
import { GameTip } from 'modules/Elements/GameTip';
import useBackgroundMusic from 'modules/hooks/useBackgroundMusic';
import { useState } from 'react';
import ResultsView from 'routes/Game/Singing/PostGame/Views/Results';
import { BackgroundThemeSetting, useSettingValue } from 'routes/Settings/SettingsState';
import SongPage from '../../SongPage';
import HighScoresView from './Views/HighScores';

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
      <div className="pointer-events-auto">
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
            'absolute bottom-10 box-border w-full bg-black/75 px-24 py-5 text-center text-3xl leading-tight text-white ' +
            'scale-0 transition-transform duration-300 data-[active=true]:scale-100'
          }
        />
      </div>
      {backgroundTheme === 'christmas' && (
        <span className="typography fixed bottom-5 left-5 text-sm">
          Credit to <a href="https://www.FesliyanStudios.com">https://www.FesliyanStudios.com</a> for the background
          music.
        </span>
      )}
    </SongPage>
  );
}
export default PostGameView;
