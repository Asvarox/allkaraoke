import { MenuButton } from 'Elements/Menu';
import { Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import ConnectPhone from 'Scenes/ConnectPhone/ConnectPhone';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import { usePlayerInput } from 'Scenes/SelectInput/hooks/usePlayerInput';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { useRemoteMicAutoselect } from 'Scenes/SelectInput/hooks/useRemoteMicAutoselect';
import { useEffect } from 'react';

interface Props {
    onSetupComplete: (complete: boolean) => void;
    onBack: () => void;
    onSave: () => void;
    closeButtonText: string;
    playerNames?: string[];
}

function Advanced(props: Props) {
    const inputs = useMicrophoneList(true);
    const [p1Source, p1CycleSource, p1Input, p1CycleInput] = usePlayerInput(0, inputs);
    const [p2Source, p2CycleSource, p2Input, p2CycleInput] = usePlayerInput(1, inputs);

    useEffect(() => {
        props.onSetupComplete(true);
    }, []);

    useRemoteMicAutoselect();

    const { register } = useKeyboardNav({ onBackspace: props.onBack });

    return (
        <>
            <ConnectPhone />
            <h2>Player 1 {props.playerNames?.[0] && `(${props.playerNames[0]})`}</h2>
            <Switcher
                {...register('player 1 source', p1CycleSource)}
                label="Source"
                value={p1Source}
                data-test="player-1-source"
            />
            <Switcher
                {...register('player 1 input', p1CycleInput)}
                label="Input"
                value={p1Input?.label}
                data-test="player-1-input"
            />
            <h2>Player 2 {props.playerNames?.[1] && `(${props.playerNames[1]})`}</h2>
            <Switcher
                {...register('player 2 source', p2CycleSource)}
                label="Source"
                value={p2Source}
                data-test="player-2-source"
            />
            <Switcher
                {...register('player 2 input', p2CycleInput)}
                label="Input"
                value={p2Input?.label}
                data-test="player-2-input"
            />
            <hr />
            {p1Source === MicrophoneInputSource.inputName &&
                p2Source === MicrophoneInputSource.inputName &&
                p1Input?.deviceId !== p2Input?.deviceId && (
                    <h3 data-test="mic-mismatch-warning">Using different microphone devices is not yet supported</h3>
                )}
            <MenuButton {...register('back', props.onBack)} data-test="back-button">
                Back
            </MenuButton>
            <MenuButton {...register('on save', props.onSave)} data-test="save-button">
                {props.closeButtonText}
            </MenuButton>
        </>
    );
}
export default Advanced;
