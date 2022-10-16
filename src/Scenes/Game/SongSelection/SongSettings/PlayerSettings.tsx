import styled from '@emotion/styled';
import { Button } from 'Elements/Button';
import useKeyboardNav from 'hooks/useKeyboardNav';
import { SongPreview } from 'interfaces';
import { useRef, useState } from 'react';
import { Input } from 'Scenes/Game/SongSelection/Input';

interface Props {
    songPreview: SongPreview;
    onNextStep: (players: Array<{ name: string }>) => void;
    keyboardControl: boolean;
    onExitKeyboardControl: () => void;
}
export default function PlayerSettings({ songPreview, onNextStep, keyboardControl, onExitKeyboardControl }: Props) {
    const p1NameRef = useRef<HTMLInputElement | null>(null);
    const [p1Name, setP1Name] = useState('');
    const p2NameRef = useRef<HTMLInputElement | null>(null);
    const [p2Name, setP2Name] = useState('');

    const startSong = () => {
        onNextStep([{ name: p1Name }, { name: p2Name }]);
    };

    const { register } = useKeyboardNav({ enabled: keyboardControl, onBackspace: onExitKeyboardControl });

    return (
        <>
            <h3>Player 1</h3>
            <Input
                onChange={setP1Name}
                value={p1Name}
                label="Name"
                ref={p1NameRef}
                {...register('p1name', () => p1NameRef.current?.focus())}
            />
            <h3>Player 2</h3>
            <Input
                onChange={setP2Name}
                value={p2Name}
                label="Name"
                ref={p2NameRef}
                {...register('p2name', () => p2NameRef.current?.focus())}
            />
            <PlayButton {...register('play', startSong, undefined, true)} data-test="play-song-button">
                Play
            </PlayButton>
        </>
    );
}

const PlayButton = styled(Button)<{ focused: boolean }>`
    padding-left: 2em;
    padding-right: 2em;
`;
