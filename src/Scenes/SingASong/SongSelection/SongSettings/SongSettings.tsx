import styled from '@emotion/styled';
import events from 'GameEvents/GameEvents';
import GameSettings from 'Scenes/SingASong/SongSelection/SongSettings/GameSettings';
import MicCheck from 'Scenes/SingASong/SongSelection/SongSettings/MicCheck';
import PlayerSettings from 'Scenes/SingASong/SongSelection/SongSettings/PlayerSettings';
import { PlayerSetup, SingSetup, SongPreview } from 'interfaces';
import { useState } from 'react';

interface Props {
    songPreview: SongPreview;
    onPlay: (setup: SingSetup & { songId: string; video: string }) => void;
    keyboardControl: boolean;
    onExitKeyboardControl: () => void;
}

export default function SongSettings({ songPreview, onPlay, keyboardControl, onExitKeyboardControl }: Props) {
    const [singSetup, setSingSetup] = useState<SingSetup | null>(null);
    const [step, setStep] = useState<'song' | 'players'>('song');

    const onSongStepFinish = (setup: SingSetup) => {
        setSingSetup(setup);
        setStep('players');
    };
    const startSong = (players: PlayerSetup[]) => {
        if (!singSetup) return;
        const finalSetup = {
            ...singSetup,
            players: players,
        };
        events.songStarted.dispatch(songPreview, finalSetup);
        onPlay({ songId: songPreview.id, video: songPreview.video, ...finalSetup });
    };
    return (
        <Container>
            <MicCheck />
            <GameConfiguration>
                {step === 'song' && (
                    <GameSettings
                        songPreview={songPreview}
                        onNextStep={onSongStepFinish}
                        keyboardControl={keyboardControl}
                        onExitKeyboardControl={onExitKeyboardControl}
                    />
                )}
                {step === 'players' && (
                    <PlayerSettings
                        songPreview={songPreview}
                        onNextStep={startSong}
                        keyboardControl={keyboardControl}
                        onExitKeyboardControl={() => setStep('song')}
                    />
                )}
            </GameConfiguration>
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;

    hr {
        margin: 1rem;
        opacity: 0.25;
    }
`;

const GameConfiguration = styled.div`
    width: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1.25rem;
`;
