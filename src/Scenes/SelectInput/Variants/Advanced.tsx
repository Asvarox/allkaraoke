import { MenuButton } from 'Elements/Menu';
import { Switcher } from 'Elements/Switcher';
import useKeyboardNav from 'hooks/useKeyboardNav';
import ConnectRemoteMic from 'Scenes/ConnectRemoteMic/ConnectRemoteMic';
import { useMicrophoneList } from 'Scenes/SelectInput/hooks/useMicrophoneList';
import { usePlayerInput } from 'Scenes/SelectInput/hooks/usePlayerInput';
import { MicrophoneInputSource } from 'Scenes/SelectInput/InputSources/Microphone';
import { useRemoteMicAutoselect } from 'Scenes/SelectInput/hooks/useRemoteMicAutoselect';
import { useEffect } from 'react';
import { PlayerMicCheck } from 'Elements/VolumeIndicator';
import styled from '@emotion/styled';
import InputManager from 'Scenes/Game/Singing/Input/InputManager';
import UserMediaEnabled from 'UserMedia/UserMediaEnabled';
import { useMicrophoneStatus } from 'UserMedia/hooks';
import isWindows from 'utils/isWindows';
import { useEventListenerSelector } from 'GameEvents/hooks';
import events from 'GameEvents/GameEvents';
import { MicSetupPreference } from 'Scenes/Settings/SettingsState';
import { ValuesType } from 'utility-types';
import isChromium from 'utils/isChromium';

interface Props {
    onSetupComplete: (complete: boolean) => void;
    onBack: () => void;
    onSave: () => void;
    closeButtonText: string;
    playerNames?: string[];
    changePreference: (pref: ValuesType<typeof MicSetupPreference>) => void;
}

const PlayerSelector = (props: {
    number: number;
    name?: string;
    inputs: ReturnType<typeof useMicrophoneList>;
    register: ReturnType<typeof useKeyboardNav>['register'];
}) => {
    const [source, cycleSource, input, cycleInput] = usePlayerInput(props.number, props.inputs);
    return (
        <>
            <SwitcherWithPlayerHeader
                {...props.register(`player ${props.number} source`, cycleSource)}
                label={
                    props.name ? (
                        <span className="ph-no-capture">{props.name} Source</span>
                    ) : (
                        `Player ${props.number + 1} Source`
                    )
                }
                value={source}
                data-test={`player-${props.number}-source`}
            />
            <SwitcherWithMicCheck
                {...props.register(`player ${props.number} input`, cycleInput)}
                label="Input"
                value={input?.label}
                data-test={`player-${props.number}-input`}>
                <MicCheck playerNumber={props.number} />
            </SwitcherWithMicCheck>
        </>
    );
};

function Advanced(props: Props) {
    const inputs = useMicrophoneList(true);
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

    const [p1, p2] = useEventListenerSelector(events.playerInputChanged, () => [
        InputManager.getPlayerInput(0),
        InputManager.getPlayerInput(1),
    ]);

    const isBothMicrophones =
        p1?.inputSource === MicrophoneInputSource.inputName && p2?.inputSource === MicrophoneInputSource.inputName;

    return (
        <>
            <UserMediaEnabled fallback={<h2>Please allow access to the microphone so we can show them.</h2>}>
                <ConnectRemoteMic />
                <PlayerSelector inputs={inputs} number={0} register={register} name={props.playerNames?.[0]} />
                <PlayerSelector inputs={inputs} number={1} register={register} name={props.playerNames?.[1]} />
                <hr />
                {isBothMicrophones && p1?.deviceId !== p2?.deviceId && (
                    <h3 data-test="mic-mismatch-warning">Using different microphone devices is not yet supported</h3>
                )}
                {isBothMicrophones && isChromium() && isWindows() && (
                    <h3>
                        <strong>Chrome</strong> is known for not handling SingStar mics well. If you notice any
                        problems, try using an alternative browser (eg. <strong>MS Edge</strong> or{' '}
                        <strong>Firefox</strong>)
                    </h3>
                )}
            </UserMediaEnabled>
            <MenuButton {...register('back', props.onBack)} data-test="back-button">
                Back to Input Selection
            </MenuButton>
            <MenuButton {...register('on save', props.onSave)} data-test="save-button">
                {props.closeButtonText}
            </MenuButton>
        </>
    );
}

const MicCheck = styled(PlayerMicCheck)`
    opacity: 0.75;
    width: 50%;
    height: calc(100% - 0.5rem);
    margin: 0.25rem;
`;

const SwitcherWithMicCheck = styled(Switcher)`
    position: relative;
`;

const SwitcherWithPlayerHeader = styled(Switcher)`
    background: none;
`;

export default Advanced;
