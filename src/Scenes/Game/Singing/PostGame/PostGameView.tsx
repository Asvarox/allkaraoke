import styled from '@emotion/styled';
import { GameTip } from 'Elements/GameTip';
import ResultsView from 'Scenes/Game/Singing/PostGame/Views/Results';
import useBackgroundMusic from 'hooks/useBackgroundMusic';
import { DetailedScore, SingSetup, Song } from 'interfaces';
import { useState } from 'react';
import SongPage from '../../SongPage';
import HighScoresView from './Views/HighScores';

export interface PlayerScore {
    detailedScore: [DetailedScore, DetailedScore];
    playerNumber: number;
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
    useBackgroundMusic(true);
    const [step, setStep] = useState<'results' | 'highscores'>('results');

    return (
        <SongPage songData={song} width={width} height={height}>
            <Container>
                {step === 'results' && (
                    <ResultsView
                        onNextStep={() => setStep('highscores')}
                        players={players}
                        singSetup={singSetup}
                        highScores={highScores}
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
                <PostGameTip active />
            </Container>
        </SongPage>
    );
}

const Container = styled.div`
    pointer-events: auto;
`;

export default PostGameView;

const PostGameTip = styled(GameTip)<{ active: boolean }>`
    transition: 300ms;
    transform: scale(${({ active }) => (active ? 1 : 0)});
    position: absolute;
    bottom: 20rem;
    font-size: 3.2rem;
    line-height: 1.25;
    color: white;
    text-align: center;
    background: rgba(0, 0, 0, 0.75);
    width: 100%;
    box-sizing: border-box;

    padding: 2rem 10rem;

    kbd {
        padding: 0.12rem 0.9rem;
        border-radius: 1rem;
        border: 0.5rem solid rgb(204, 204, 204);
        border-bottom-color: rgb(150, 150, 150);
        border-right-color: rgb(150, 150, 150);
        color: rgb(51, 51, 51);
        line-height: 1.4;
        display: inline-block;
        box-shadow: 0 0.1rem 0 rgba(0, 0, 0, 0.2), inset 0 0 0 0.2rem #ffffff;
        background-color: rgb(247, 247, 247);
        text-shadow: 0 0.1rem 0 #fff;
        font-weight: normal;
    }
`;
