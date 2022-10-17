import styled from '@emotion/styled';
import { typography } from 'Elements/cssMixins';
import { PlayerSetup, SingSetup, SongPreview } from 'interfaces';
import { useState } from 'react';
import styles from 'Scenes/Game/Singing/GameOverlay/Drawing/styles';
import events from 'Scenes/Game/Singing/GameState/GameStateEvents';
import GameSettings from 'Scenes/Game/SongSelection/SongSettings/GameSettings';
import MicCheck from 'Scenes/Game/SongSelection/SongSettings/MicCheck';
import PlayerSettings from 'Scenes/Game/SongSelection/SongSettings/PlayerSettings';

interface Props {
    songPreview: SongPreview;
    onPlay: (setup: SingSetup & { file: string; video: string }) => void;
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
    const startSong = (players: Array<{ name: string }>) => {
        if (!singSetup) return;
        const finalSetup = {
            ...singSetup,
            players: players.map(({ name }, index) => ({
                name,
                track: singSetup.players[index].track,
            })) as [PlayerSetup, PlayerSetup],
        };
        events.songStarted.dispatch(songPreview, finalSetup);
        onPlay({ file: songPreview.file, video: songPreview.video, ...finalSetup });
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

    h1 {
        ${typography};
        margin: 0;
        text-align: center;
        font-size: 1.5em;
        color: ${styles.colors.text.active};
    }

    h2 {
        ${typography};
        margin: 0;
        font-size: 1.15em;
    }

    h3 {
        ${typography};
        margin: 0;
        font-size: 1.05em;

        strong {
            color: ${styles.colors.text.active};
        }
    }

    h4 {
        ${typography};
        margin: 0;
        font-size: 0.85em;
    }

    hr {
        margin: 10px;
        opacity: 0.25;
    }
`;

const GameConfiguration = styled.div`
    width: auto;
    font-size: 0.35em;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5em;
`;
