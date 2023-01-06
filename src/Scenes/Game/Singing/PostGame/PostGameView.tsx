import styled from '@emotion/styled';
import { DetailedScore, Song } from 'interfaces';
import { SyntheticEvent, useState } from 'react';
import ResultsView from 'Scenes/Game/Singing/PostGame/Views/Results';
import SongPage from '../../SongPage';
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

function PostGameView({ song, width, height, onClickSongSelection, players, highScores, singSetupId }: Props) {
    const [step, setStep] = useState<'results' | 'highscores'>('results');

    return (
        <SongPage songData={song} width={width} height={height}>
            <Container>
                {step === 'results' && (
                    <ResultsView
                        onNextStep={() => setStep('highscores')}
                        players={players}
                        singSetupId={singSetupId}
                        highScores={highScores}
                    />
                )}
                {step === 'highscores' && (
                    <HighScoresView
                        onNextStep={onClickSongSelection}
                        singSetupId={singSetupId}
                        highScores={highScores}
                        song={song}
                    />
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
            </Container>
        </SongPage>
    );
}

const Container = styled.div`
    pointer-events: auto;
`;

export default PostGameView;
