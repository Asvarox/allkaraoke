import { MenuButton } from 'Elements/Menu';
import { Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import ConnectPhone from 'Scenes/ConnectPhone/ConnectPhone';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import { usePlayerInput } from 'Scenes/SelectInput/hooks/usePlayerInput';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { useRemoteMicAutoselect } from 'Scenes/SelectInput/hooks/useRemoteMicAutoselect';
import { useEffect } from 'react';
import VolumeIndicator from 'Scenes/Game/VolumeIndicator';
import styled from '@emotion/styled';
import { Mic } from '@mui/icons-material';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import UserMediaEnabled from 'UserMedia/UserMediaEnabled';
import { useMicrophoneStatus } from 'UserMedia/hooks';
import isWindows from 'utils/isWindows';

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
    const status = useMicrophoneStatus();

    useEffect(() => {
        props.onSetupComplete(status === 'accepted');
    }, [status]);

    useEffect(() => {
        InputManager.startMonitoring();
        return () => {
            InputManager.stopMonitoring();
        };
    }, []);

    useRemoteMicAutoselect();

    const { register } = useKeyboardNav({ onBackspace: props.onBack });

    return (
        <>
            <UserMediaEnabled fallback={<h2>Please allow access to the microphone so we can show them.</h2>}>
                <ConnectPhone />
                <Heading>
                    <MicCheck playerNumber={0}>
                        <Mic />
                    </MicCheck>{' '}
                    Player 1 {props.playerNames?.[0] && `(${props.playerNames[0]})`}
                </Heading>
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
                <Heading>
                    <MicCheck playerNumber={1}>
                        <Mic />
                    </MicCheck>{' '}
                    Player 2 {props.playerNames?.[1] && `(${props.playerNames[1]})`}
                </Heading>
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
                        <h3 data-test="mic-mismatch-warning">
                            Using different microphone devices is not yet supported
                        </h3>
                    )}
                {p1Source === MicrophoneInputSource.inputName &&
                    p2Source === MicrophoneInputSource.inputName &&
                    window.chrome &&
                    isWindows() && (
                        <h3>
                            <strong>Chrome</strong> is known for not handling SingStar mics well. If you notice any
                            problems, try using an alternative browser (eg. <strong>MS Edge</strong> or{' '}
                            <strong>Firefox</strong>)
                        </h3>
                    )}
            </UserMediaEnabled>
            <MenuButton {...register('back', props.onBack)} data-test="back-button">
                Back
            </MenuButton>
            <MenuButton {...register('on save', props.onSave)} data-test="save-button">
                {props.closeButtonText}
            </MenuButton>
        </>
    );
}

const MicCheck = styled(VolumeIndicator)`
    display: inline-flex;
    padding: 0.1rem 1rem;

    svg {
        font-size: 2.4rem;
    }
`;

const Heading = styled.h2`
    display: flex;
    align-items: center;
    gap: 1.25rem;
`;

export default Advanced;
