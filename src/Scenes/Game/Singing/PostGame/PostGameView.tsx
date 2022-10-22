import { DetailedScore, Song } from 'interfaces';
import { SyntheticEvent, useState } from 'react';
import ResultsView from 'Scenes/Game/Singing/PostGame/Views/Results';
import SongPage from '../../SongPage';
import { MAX_POINTS } from '../GameState/Helpers/calculateScore';
import backgroundMusic from './421888__b-sean__retro.mp3';
import HighScoresView from './Views/HighScores';

interface PlayerScore {
    detailedScore: [number, DetailedScore, DetailedScore];
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
    singSetupId: string;
    highScores: HighScoreEntity[];
}

const MAX_TICKS = Math.floor(6100 / 16);

const POINTS_PER_TICK = MAX_POINTS / MAX_TICKS;

function PostGameView({ song, width, height, onClickSongSelection, players, highScores, singSetupId }: Props) {
    const [step, setStep] = useState<'results' | 'highscores'>('results');

    return (
        <SongPage songData={song} width={width} height={height}>
            {step === 'results' && (
                <ResultsView
                    onNextStep={() => setStep('highscores')}
                    players={players}
                    singSetupId={singSetupId}
                    highScores={highScores}
                />
            )}
            {step === 'highscores' && (
                <HighScoresView onNextStep={onClickSongSelection} singSetupId={singSetupId} highScores={highScores} />
            )}
            <audio
                src={backgroundMusic}
                loop
                hidden
                autoPlay
                onPlay={(e: SyntheticEvent<HTMLAudioElement>) => {
                    e.currentTarget.volume = 0.4;
                }}
            />
        </SongPage>
    );
}

export default PostGameView;
